import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import { createInvoice } from '@/lib/xendit';
import { calculateBorrowingFine } from '@/lib/fineCalculator';

/**
 * POST /api/payments/create
 * Buat pembayaran untuk denda
 */
export async function POST(request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { borrowingId } = await request.json();

    if (!borrowingId) {
      return NextResponse.json({ error: 'Borrowing ID is required' }, { status: 400 });
    }

    // Ambil detail peminjaman
    const [borrowings] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, 
       bk.title as book_title
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ? AND b.user_id = ?`,
      [borrowingId, session.user.id]
    );

    if (borrowings.length === 0) {
      return NextResponse.json({ error: 'Borrowing not found' }, { status: 404 });
    }

    const borrowing = borrowings[0];

    // Cek apakah sudah dibayar
    if (borrowing.fine_paid) {
      return NextResponse.json({ error: 'Fine already paid' }, { status: 400 });
    }

    // Hitung denda kalau belum dihitung
    let fineAmount = borrowing.fine_amount || 0;
    let fineDays = borrowing.fine_days || 0;

    if (fineAmount === 0 || fineDays === 0) {
      const fineCalculation = calculateBorrowingFine(
        borrowing.due_date,
        borrowing.return_date || new Date()
      );
      
      fineAmount = fineCalculation.fineAmount;
      fineDays = fineCalculation.lateDays;

      // Update peminjaman dengan denda yang udah dihitung
      await pool.execute(
        `UPDATE borrowings 
         SET fine_amount = ?, fine_days = ?
         WHERE id = ?`,
        [fineAmount, fineDays, borrowingId]
      );
    }

    if (fineAmount === 0) {
      return NextResponse.json({ error: 'No fine to pay' }, { status: 400 });
    }

    // Generate external ID yang unik
    const externalId = `FINE-${borrowingId}-${Date.now()}`;

    // Buat invoice lewat Xendit
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invoice = await createInvoice({
      externalId,
      amount: fineAmount,
      customerName: borrowing.user_name,
      customerEmail: borrowing.user_email,
      description: `Denda Keterlambatan: ${borrowing.book_title} (${fineDays} hari)`,
      successRedirectUrl: `${baseUrl}/payment/success?external_id=${externalId}`,
    });

    // Update peminjaman dengan ID invoice Xendit
    // Set fine_paid_at langsung biar status check bisa auto-update ke pending_verification
    await pool.execute(
      `UPDATE borrowings 
       SET xendit_invoice_id = ?, 
           xendit_payment_status = 'pending',
           fine_paid_at = NOW()
       WHERE id = ?`,
      [invoice.invoiceId, borrowingId]
    );

    return NextResponse.json({
      invoiceUrl: invoice.invoiceUrl,
      invoiceId: invoice.invoiceId,
      externalId: invoice.externalId,
      amount: fineAmount,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getInvoiceStatus } from '@/lib/xendit';
import crypto from 'crypto';

/**
 * POST /api/payments/callback
 * Handle webhook notification dari Xendit
 */
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Xendit callback received:', JSON.stringify(body, null, 2));
    
    const { id, status, external_id } = body;

    // Verifikasi signature webhook (opsional tapi direkomendasikan)
    const xenditCallbackToken = request.headers.get('x-callback-token');
    const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
    
    if (expectedToken && xenditCallbackToken !== expectedToken) {
      console.error('Invalid callback token');
      return NextResponse.json({ error: 'Invalid callback token' }, { status: 401 });
    }

    // Ambil borrowing ID dari external ID (format: FINE-{borrowingId}-{timestamp})
    const borrowingId = external_id?.split('-')[1];

    if (!borrowingId || !id) {
      console.error('Invalid invoice data:', { id, external_id, borrowingId });
      return NextResponse.json({ error: 'Invalid invoice data' }, { status: 400 });
    }
    
    console.log('Processing callback for borrowing:', borrowingId, 'invoice:', id, 'status:', status);

    // Cek apakah invoice ID cocok
    const [borrowings] = await pool.execute(
      `SELECT xendit_invoice_id, fine_paid FROM borrowings WHERE id = ?`,
      [borrowingId]
    );

    if (borrowings.length === 0) {
      console.error('Borrowing not found:', borrowingId);
      return NextResponse.json({ error: 'Borrowing not found' }, { status: 404 });
    }
    
    if (borrowings[0].xendit_invoice_id !== id) {
      console.error('Invoice ID mismatch:', {
        expected: borrowings[0].xendit_invoice_id,
        received: id
      });
      return NextResponse.json({ error: 'Invoice ID mismatch' }, { status: 400 });
    }

    // Update status pembayaran berdasarkan status invoice
    // Set ke pending_verification untuk status PAID - butuh verifikasi petugas
    let paymentStatus = 'pending';
    let finePaid = false;
    let finePaidAt = null;

    if (status === 'PAID') {
      // Set to pending_verification - petugas perlu verifikasi manual
      paymentStatus = 'pending_verification';
      finePaid = false; // Belum dikonfirmasi petugas
      finePaidAt = new Date(); // Simpan waktu pembayaran
    } else if (status === 'PENDING') {
      paymentStatus = 'pending';
    } else if (status === 'EXPIRED') {
      paymentStatus = 'expired';
    } else if (status === 'FAILED') {
      paymentStatus = 'failed';
    }

    // Update peminjaman
    await pool.execute(
      `UPDATE borrowings 
       SET xendit_payment_status = ?, fine_paid = ?, fine_paid_at = ?
       WHERE id = ?`,
      [paymentStatus, finePaid, finePaidAt, borrowingId]
    );

    console.log('Payment status updated:', {
      borrowingId,
      paymentStatus,
      finePaid,
      finePaidAt
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}


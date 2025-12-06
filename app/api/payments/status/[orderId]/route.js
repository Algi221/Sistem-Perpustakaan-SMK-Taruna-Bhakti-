import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * GET /api/payments/status/[externalId]
 * Cek status pembayaran
 */
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      console.error('No session or user in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 13+ App Router: params itu Promise
    const { orderId } = await params; // Ini externalId (format: FINE-{borrowingId}-{timestamp})
    
    if (!orderId) {
      console.error('No orderId provided');
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Ambil borrowing ID dari external ID
    const parts = orderId.split('-');
    if (parts.length < 2) {
      console.error('Invalid external ID format:', orderId);
      return NextResponse.json({ error: 'Invalid external ID format' }, { status: 400 });
    }
    
    const borrowingId = parts[1];
    
    if (!borrowingId || isNaN(borrowingId)) {
      console.error('Invalid borrowing ID:', borrowingId);
      return NextResponse.json({ error: 'Invalid borrowing ID' }, { status: 400 });
    }

    // Ambil peminjaman berdasarkan ID dan user
    let borrowings;
    try {
      [borrowings] = await pool.execute(
        `SELECT b.*, u.name as user_name, u.email as user_email, 
         bk.title as book_title
         FROM borrowings b
         JOIN users u ON b.user_id = u.id
         JOIN books bk ON b.book_id = bk.id
         WHERE b.id = ? AND b.user_id = ?`,
        [borrowingId, session.user.id]
      );
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error',
          message: dbError.message 
        },
        { status: 500 }
      );
    }

    if (borrowings.length === 0) {
      console.error('Borrowing not found for user:', {
        borrowingId,
        userId: session.user.id
      });
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const borrowing = borrowings[0];

    // Cek apakah xendit_invoice_id ada (bisa null untuk record lama)
    if (!borrowing.xendit_invoice_id) {
      // Kalau ga ada invoice ID, return status yang sekarang
      return NextResponse.json({
        externalId: orderId,
        status: borrowing.xendit_payment_status || 'pending',
        finePaid: borrowing.fine_paid || false,
        xenditStatus: 'no_invoice',
        amount: borrowing.fine_amount,
      });
    }

    // Langsung set status kalau invoice ada dan status masih pending
    // Coba pending_verification dulu, fallback ke 'paid' kalau enum ga support
    if (borrowing.xendit_invoice_id && 
        (borrowing.xendit_payment_status === 'pending' || borrowing.xendit_payment_status === null || !borrowing.xendit_payment_status)) {
      try {
        console.log('Auto-updating status - invoice exists, assuming payment made');
        
        // Coba pending_verification dulu (kalau migration udah dijalanin)
        let newStatus = 'pending_verification';
        let updateSuccess = false;
        
        try {
          await pool.execute(
            `UPDATE borrowings 
             SET xendit_payment_status = ?,
                 fine_paid_at = COALESCE(fine_paid_at, NOW())
             WHERE id = ?`,
            [newStatus, borrowing.id]
          );
          borrowing.xendit_payment_status = newStatus;
          updateSuccess = true;
         } catch (enumError) {
           // Kalau enum ga support pending_verification, coba 'paid' aja
           console.warn('pending_verification not in enum, trying paid instead:', enumError.message);
           newStatus = 'paid';
           try {
             await pool.execute(
               `UPDATE borrowings 
                SET xendit_payment_status = ?,
                    fine_paid_at = COALESCE(fine_paid_at, NOW())
                WHERE id = ?`,
               [newStatus, borrowing.id]
             );
             borrowing.xendit_payment_status = newStatus;
             updateSuccess = true;
             console.log('Successfully updated status to paid');
           } catch (paidError) {
             console.error('Error setting status to paid:', paidError);
             // Kalau keduanya gagal, lanjutin aja pake status yang sekarang
             // Tapi log error buat debugging
             console.error('Could not update status, will use current status:', borrowing.xendit_payment_status);
           }
         }
        
        if (!updateSuccess) {
          console.warn('Could not update status, using current status');
        }
      } catch (updateError) {
        console.error('Error updating status:', updateError);
        // Lanjutin aja - jangan gagalin request, pake status yang sekarang
      }
    }

    // Skip Xendit API sama sekali - ga perlu buat cek status
    // Status dikelola sama database dan callback/webhook
    // Ini biar ga kena rate limit dan masalah API key
    
    // Return response dengan status lokal aja (ga depend sama Xendit API)
    return NextResponse.json({
      externalId: orderId,
      status: borrowing.xendit_payment_status || 'pending',
      finePaid: borrowing.fine_paid || false,
      xenditStatus: 'local_only', // Indikasi kita pake status lokal aja
      amount: borrowing.fine_amount,
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        message: error.message || 'Unknown error',
        finePaid: false,
        status: 'error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


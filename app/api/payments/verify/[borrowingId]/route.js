import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * POST /api/payments/verify/[borrowingId]
 * Petugas verifikasi pembayaran denda (approve atau reject)
 */
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    
    if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { borrowingId } = await params;
    const { action, note } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Ambil detail peminjaman
    // Terima status 'pending_verification' dan 'paid' (kalau enum ga support pending_verification)
    // Selama fine_paid = FALSE, berarti perlu verifikasi
    const [borrowings] = await pool.execute(
      `SELECT * FROM borrowings 
       WHERE id = ? 
         AND (xendit_payment_status = 'pending_verification' OR xendit_payment_status = 'paid')
         AND fine_paid = FALSE
         AND fine_amount > 0`,
      [borrowingId]
    );

    if (borrowings.length === 0) {
      return NextResponse.json({ error: 'Borrowing not found or already processed' }, { status: 404 });
    }

    const borrowing = borrowings[0];

    // Ambil ID staff/admin buat verifikasi
    let verifiedById = null;
    if (session.user.role === 'staff') {
      verifiedById = session.user.id;
    } else if (session.user.role === 'admin') {
      // Buat admin, kita simpan admin ID di fine_verified_by
      // Karena admin table mungkin punya struktur beda, kita pake session user ID
      // Mungkin perlu disesuaikan tergantung struktur admin table lo
      verifiedById = session.user.id;
    }

    if (action === 'approve') {
      // Approve pembayaran
      // Coba set fine_verified_by, fine_verified_at, fine_verification_note
      // Kalau kolom ga ada, update fine_paid aja
      try {
        await pool.execute(
          `UPDATE borrowings 
           SET xendit_payment_status = 'paid',
               fine_paid = TRUE,
               fine_verified_by = ?,
               fine_verified_at = NOW(),
               fine_verification_note = ?
           WHERE id = ?`,
          [
            verifiedById,
            note || 'Pembayaran diverifikasi dan disetujui',
            borrowingId
          ]
        );
      } catch (error) {
        // Kalau kolom verifikasi ga ada, update fine_paid aja
        if (error.message?.includes('fine_verified_by') || error.code === 'ER_BAD_FIELD_ERROR') {
          console.warn('Verification columns not found, updating fine_paid only');
          await pool.execute(
            `UPDATE borrowings 
             SET xendit_payment_status = 'paid',
                 fine_paid = TRUE
             WHERE id = ?`,
            [borrowingId]
          );
        } else {
          throw error;
        }
      }
    } else {
      // Reject pembayaran
      try {
        await pool.execute(
          `UPDATE borrowings 
           SET xendit_payment_status = 'rejected',
               fine_verified_by = ?,
               fine_verified_at = NOW(),
               fine_verification_note = ?
           WHERE id = ?`,
          [
            verifiedById,
            note || 'Pembayaran ditolak',
            borrowingId
          ]
        );
      } catch (error) {
        // Kalau kolom verifikasi ga ada, update status aja
        if (error.message?.includes('fine_verified_by') || error.code === 'ER_BAD_FIELD_ERROR') {
          console.warn('Verification columns not found, updating status only');
          // Coba 'rejected', kalau ga support, pake 'failed'
          try {
            await pool.execute(
              `UPDATE borrowings 
               SET xendit_payment_status = 'rejected'
               WHERE id = ?`,
              [borrowingId]
            );
          } catch (rejectError) {
            // Kalau 'rejected' ga ada di enum, pake 'failed'
            await pool.execute(
              `UPDATE borrowings 
               SET xendit_payment_status = 'failed'
               WHERE id = ?`,
              [borrowingId]
            );
          }
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: action === 'approve' ? 'Pembayaran berhasil diverifikasi' : 'Pembayaran ditolak'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    return NextResponse.json(
      { 
        error: 'Failed to verify payment', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


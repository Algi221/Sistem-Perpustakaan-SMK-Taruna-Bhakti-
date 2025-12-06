import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * Cron job endpoint untuk mengecek dan membatalkan peminjaman yang pending > 1 jam
 * Endpoint ini bisa dipanggil oleh cron job eksternal atau Vercel Cron
 * 
 * Untuk Vercel Cron, tambahkan ke vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-expired-borrowings",
 *     "schedule": "*/5 * * * *"
 *   }]
 * }
 */
export async function GET(request) {
  try {
    // Verifikasi bahwa request berasal dari cron job (opsional, bisa ditambahkan secret key)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cari peminjaman yang pending lebih dari 1 jam
    const [expiredBorrowings] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, bk.title as book_title
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status = 'pending'
       AND TIMESTAMPDIFF(HOUR, b.created_at, NOW()) >= 1
       ORDER BY b.created_at ASC`
    );

    const cancelledCount = expiredBorrowings.length;
    const cancelledIds = [];

    // Batalkan semua peminjaman yang expired
    for (const borrowing of expiredBorrowings) {
      // Update status menjadi rejected
      await pool.execute(
        `UPDATE borrowings 
         SET status = 'rejected', updated_at = NOW() 
         WHERE id = ?`,
        [borrowing.id]
      );

      // Buat notifikasi untuk user bahwa peminjaman dibatalkan
      await pool.execute(
        `INSERT INTO messages (borrowing_id, sender_id, sender_role, receiver_id, receiver_role, message, type, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          borrowing.id,
          0, // System
          'system',
          borrowing.user_id,
          'user',
          `Peminjaman buku "${borrowing.book_title}" telah dibatalkan karena tidak diproses dalam waktu 1 jam. Staff akan memberikan alasan segera.`,
          'warning',
          false
        ]
      );

      cancelledIds.push(borrowing.id);
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil membatalkan ${cancelledCount} peminjaman yang expired`,
      cancelledCount,
      cancelledIds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking expired borrowings:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan',
        message: error.message 
      },
      { status: 500 }
    );
  }
}



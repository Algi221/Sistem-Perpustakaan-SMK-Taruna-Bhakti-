import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * API untuk mengecek dan membatalkan peminjaman yang pending lebih dari 1 jam
 * Endpoint ini bisa dipanggil secara berkala (cron job) atau manual
 */
export async function POST(request) {
  try {
    const session = await getSession();

    // Hanya admin atau staff yang bisa menjalankan ini
    // Atau bisa juga dijalankan sebagai cron job tanpa session
    if (session && session.user.role !== 'staff' && session.user.role !== 'admin') {
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
      // Staff akan diminta mengisi alasan nanti
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
    }

    return NextResponse.json({
      message: `Berhasil membatalkan ${cancelledCount} peminjaman yang expired`,
      cancelledCount,
      expiredBorrowings: expiredBorrowings.map(b => ({
        id: b.id,
        userId: b.user_id,
        userName: b.user_name,
        bookTitle: b.book_title
      }))
    });
  } catch (error) {
    console.error('Error checking expired borrowings:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint untuk mendapatkan daftar peminjaman yang perlu alasan pembatalan
 */
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cari peminjaman yang rejected dan belum ada alasan dari staff
    const [pendingReasons] = await pool.execute(
      `SELECT DISTINCT b.*, u.name as user_name, u.email as user_email, bk.title as book_title
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       LEFT JOIN messages m ON b.id = m.borrowing_id AND m.type = 'cancellation_reason' AND m.sender_role IN ('staff', 'admin')
       WHERE b.status = 'rejected'
       AND m.id IS NULL
       AND TIMESTAMPDIFF(HOUR, b.updated_at, NOW()) <= 24
       ORDER BY b.updated_at DESC`
    );

    return NextResponse.json({
      pendingReasons: pendingReasons.map(b => ({
        id: b.id,
        userId: b.user_id,
        userName: b.user_name,
        userEmail: b.user_email,
        bookTitle: b.book_title,
        createdAt: b.created_at,
        updatedAt: b.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching pending reasons:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}



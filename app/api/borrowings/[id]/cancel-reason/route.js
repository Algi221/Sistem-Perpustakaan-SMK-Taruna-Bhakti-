import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * POST - Staff mengisi alasan pembatalan peminjaman
 */
export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Alasan pembatalan wajib diisi' },
        { status: 400 }
      );
    }

    // Get borrowing details
    const [borrowings] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, bk.title as book_title
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ?`,
      [id]
    );

    if (borrowings.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const borrowing = borrowings[0];

    // Pastikan status adalah rejected
    if (borrowing.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Peminjaman ini tidak dalam status rejected' },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada alasan sebelumnya
    const [existingReason] = await pool.execute(
      `SELECT id FROM messages 
       WHERE borrowing_id = ? AND type = 'cancellation_reason' AND sender_role IN ('staff', 'admin')
       LIMIT 1`,
      [id]
    );

    if (existingReason.length > 0) {
      // Update alasan yang sudah ada
      await pool.execute(
        `UPDATE messages 
         SET message = ?, updated_at = NOW() 
         WHERE id = ?`,
        [reason.trim(), existingReason[0].id]
      );
    } else {
      // Buat alasan baru
      await pool.execute(
        `INSERT INTO messages (borrowing_id, sender_id, sender_role, receiver_id, receiver_role, message, type, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          session.user.id,
          session.user.role,
          borrowing.user_id,
          'user',
          `Alasan pembatalan: ${reason.trim()}`,
          'cancellation_reason',
          false
        ]
      );
    }

    // Update notes di borrowing juga
    await pool.execute(
      `UPDATE borrowings 
       SET notes = ?, updated_at = NOW() 
       WHERE id = ?`,
      [reason.trim(), id]
    );

    return NextResponse.json({
      message: 'Alasan pembatalan berhasil disimpan dan dikirim ke user'
    });
  } catch (error) {
    console.error('Error saving cancellation reason:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}



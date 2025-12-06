import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

// POST - User requests to return a book
export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get borrowing details
    const [borrowings] = await pool.execute(
      'SELECT * FROM borrowings WHERE id = ? AND user_id = ?',
      [id, session.user.id]
    );

    if (borrowings.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const borrowing = borrowings[0];

    // Only allow return request if status is 'borrowed'
    if (borrowing.status !== 'borrowed') {
      return NextResponse.json(
        { error: 'Buku harus dalam status dipinjam untuk dapat dikembalikan' },
        { status: 400 }
      );
    }

    // Update status to 'return_requested'
    await pool.execute(
      `UPDATE borrowings 
       SET status = 'return_requested', updated_at = NOW() 
       WHERE id = ?`,
      [id]
    );

    // Get book and user info for notification
    const [bookInfo] = await pool.execute(
      'SELECT title FROM books WHERE id = ?',
      [borrowing.book_id]
    );
    const bookTitle = bookInfo[0]?.title || 'Buku';

    const [userInfo] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [borrowing.user_id]
    );
    const userName = userInfo[0]?.name || 'User';

    // Create notification for staff/admin about return request
    try {
      // Get all staff IDs
      const [staffList] = await pool.execute('SELECT id FROM staff');
      
      // Get all admin IDs
      const [adminList] = await pool.execute('SELECT id FROM admin');

      // Check if messages table exists
      const [tables] = await pool.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'messages'`,
        [process.env.DB_NAME || 'perpustakaan']
      );

      if (tables.length > 0) {
        // Create notifications for all staff
        for (const staff of staffList) {
          await pool.execute(
            `INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, borrowing_id, message, book_title, user_name, is_read, created_at)
             VALUES (?, 'user', ?, 'staff', ?, ?, ?, ?, FALSE, NOW())`,
            [
              borrowing.user_id,
              staff.id,
              borrowing.id,
              `${userName} meminta untuk mengembalikan buku "${bookTitle}"`,
              bookTitle,
              userName
            ]
          );
        }

        // Create notifications for all admins
        for (const admin of adminList) {
          await pool.execute(
            `INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, borrowing_id, message, book_title, user_name, is_read, created_at)
             VALUES (?, 'user', ?, 'admin', ?, ?, ?, ?, FALSE, NOW())`,
            [
              borrowing.user_id,
              admin.id,
              borrowing.id,
              `${userName} meminta untuk mengembalikan buku "${bookTitle}"`,
              bookTitle,
              userName
            ]
          );
        }
      }
    } catch (error) {
      // Messages table might not exist, that's okay
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error creating return request notification:', error);
      }
    }

    return NextResponse.json({
      message: 'Permintaan pengembalian buku telah dikirim. Menunggu konfirmasi dari petugas.',
      bookTitle
    });
  } catch (error) {
    console.error('Error requesting return:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}


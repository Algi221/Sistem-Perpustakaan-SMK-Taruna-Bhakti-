import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * GET - Mendapatkan semua pesan untuk user/staff yang sedang login
 */
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const borrowingId = searchParams.get('borrowingId');

    let query = `
      SELECT m.*, 
             CASE 
               WHEN m.sender_role = 'user' THEN u.name
               WHEN m.sender_role = 'staff' THEN s.name
               WHEN m.sender_role = 'admin' THEN a.name
               ELSE 'System'
             END as sender_name,
             bk.title as book_title
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id AND m.sender_role = 'user'
      LEFT JOIN staff s ON m.sender_id = s.id AND m.sender_role = 'staff'
      LEFT JOIN admin a ON m.sender_id = a.id AND m.sender_role = 'admin'
      LEFT JOIN borrowings b ON m.borrowing_id = b.id
      LEFT JOIN books bk ON b.book_id = bk.id
      WHERE (
        (m.receiver_id = ? AND m.receiver_role = ?)
        OR (m.sender_id = ? AND m.sender_role = ?)
      )
    `;

    const params = [
      session.user.id,
      session.user.role === 'siswa' || session.user.role === 'umum' ? 'user' : session.user.role,
      session.user.id,
      session.user.role === 'siswa' || session.user.role === 'umum' ? 'user' : session.user.role
    ];

    if (borrowingId) {
      query += ' AND m.borrowing_id = ?';
      params.push(borrowingId);
    }

    if (unreadOnly) {
      query += ' AND m.is_read = FALSE';
    }

    query += ' ORDER BY m.created_at DESC LIMIT 50';

    const [messages] = await pool.execute(query, params);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

/**
 * POST - Mengirim pesan baru
 */
export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { borrowingId, receiverId, receiverRole, message, type } = body;

    if (!borrowingId || !receiverId || !message) {
      return NextResponse.json(
        { error: 'borrowingId, receiverId, dan message wajib diisi' },
        { status: 400 }
      );
    }

    const senderRole = session.user.role === 'siswa' || session.user.role === 'umum' 
      ? 'user' 
      : session.user.role;

    // Insert message
    const [result] = await pool.execute(
      `INSERT INTO messages (borrowing_id, sender_id, sender_role, receiver_id, receiver_role, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        borrowingId,
        session.user.id,
        senderRole,
        receiverId,
        receiverRole || 'user',
        message,
        type || 'info',
        false
      ]
    );

    return NextResponse.json({
      message: 'Pesan berhasil dikirim',
      messageId: result.insertId
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update status read pesan
 */
export async function PATCH(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all unread messages as read for current user
      const receiverRole = session.user.role === 'siswa' || session.user.role === 'umum' 
        ? 'user' 
        : session.user.role;

      await pool.execute(
        `UPDATE messages 
         SET is_read = TRUE 
         WHERE receiver_id = ? AND receiver_role = ? AND is_read = FALSE`,
        [session.user.id, receiverRole]
      );

      return NextResponse.json({ message: 'Semua pesan ditandai sebagai dibaca' });
    }

    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      const placeholders = messageIds.map(() => '?').join(',');
      await pool.execute(
        `UPDATE messages 
         SET is_read = TRUE 
         WHERE id IN (${placeholders}) AND receiver_id = ?`,
        [...messageIds, session.user.id]
      );

      return NextResponse.json({ message: 'Pesan ditandai sebagai dibaca' });
    }

    return NextResponse.json(
      { error: 'messageIds atau markAllAsRead wajib diisi' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}



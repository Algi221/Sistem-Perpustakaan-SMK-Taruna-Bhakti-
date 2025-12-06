import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { notifications: [] },
        { status: 200 }
      );
    }

    const notifications = [];

    // Notifikasi untuk petugas/admin: permintaan pending dan konfirmasi pickup
    if (session.user.role === 'staff' || session.user.role === 'admin') {
      // Notifikasi permintaan pending
      const [pendingBorrowings] = await pool.execute(
        `SELECT b.*, u.name as user_name, bk.title, bk.author
         FROM borrowings b
         JOIN users u ON b.user_id = u.id
         JOIN books bk ON b.book_id = bk.id
         WHERE b.status = 'pending'
         ORDER BY b.created_at DESC
         LIMIT 10`
      );

      for (const borrowing of pendingBorrowings) {
        notifications.push({
          id: `pending-${borrowing.id}`,
          type: 'pending',
          title: 'Permintaan Peminjaman Baru',
          message: `${borrowing.user_name} meminta pinjam "${borrowing.title}"`,
          borrowingId: borrowing.id,
          createdAt: borrowing.created_at,
        });
      }

      // Notifikasi return request dari user
      const [returnRequests] = await pool.execute(
        `SELECT b.*, u.name as user_name, bk.title, bk.author
         FROM borrowings b
         JOIN users u ON b.user_id = u.id
         JOIN books bk ON b.book_id = bk.id
         WHERE b.status = 'return_requested'
         ORDER BY b.updated_at DESC
         LIMIT 10`
      );

      for (const borrowing of returnRequests) {
        notifications.push({
          id: `return-request-${borrowing.id}`,
          type: 'return_requested',
          title: 'Permintaan Pengembalian Buku',
          message: `${borrowing.user_name} meminta untuk mengembalikan "${borrowing.title}"`,
          borrowingId: borrowing.id,
          createdAt: borrowing.updated_at,
        });
      }

      // Notifikasi konfirmasi pickup dari user
      try {
        const receiverRole = session.user.role === 'admin' ? 'admin' : 'staff';
        const [pickupMessages] = await pool.execute(
          `SELECT m.*, u.name as user_name, bk.title as book_title
           FROM messages m
           JOIN borrowings b ON m.borrowing_id = b.id
           JOIN users u ON b.user_id = u.id
           JOIN books bk ON b.book_id = bk.id
           WHERE m.receiver_id = ?
           AND m.receiver_role = ?
           AND m.type = 'info'
           AND m.message LIKE '%telah mengkonfirmasi bahwa buku%'
           AND m.is_read = FALSE
           ORDER BY m.created_at DESC
           LIMIT 10`,
          [session.user.id, receiverRole]
        );

        for (const msg of pickupMessages) {
          notifications.push({
            id: `pickup-${msg.id}`,
            type: 'pickup',
            title: 'Konfirmasi Pengambilan Buku',
            message: msg.message,
            borrowingId: msg.borrowing_id,
            bookTitle: msg.book_title,
            userName: msg.user_name,
            createdAt: msg.created_at,
          });
        }
      } catch (error) {
        // Messages table might not exist, skip
        if (error.code !== 'ER_NO_SUCH_TABLE') {
          console.error('Error fetching pickup notifications:', error);
        }
      }

      // Notifikasi reset password request untuk admin
      if (session.user.role === 'admin') {
        try {
          const [resetPasswordRequests] = await pool.execute(
            `SELECT prr.*,
             CASE 
               WHEN prr.user_type = 'user' THEN u.name
               WHEN prr.user_type = 'staff' THEN s.name
               WHEN prr.user_type = 'admin' THEN a.name
             END as user_name
             FROM password_reset_requests prr
             LEFT JOIN users u ON prr.user_type = 'user' AND prr.user_id = u.id
             LEFT JOIN staff s ON prr.user_type = 'staff' AND prr.user_id = s.id
             LEFT JOIN admin a ON prr.user_type = 'admin' AND prr.user_id = a.id
             WHERE prr.status = 'pending'
             ORDER BY prr.created_at DESC
             LIMIT 10`
          );

          for (const request of resetPasswordRequests) {
            notifications.push({
              id: `reset-password-${request.id}`,
              type: 'reset_password',
              title: 'Permintaan Reset Password',
              message: `${request.user_name || request.email} meminta reset password`,
              requestId: request.id,
              email: request.email,
              userType: request.user_type,
              emailVerified: request.email_verified,
              createdAt: request.created_at,
            });
          }
        } catch (error) {
          console.error('Error fetching reset password notifications:', error);
        }
      }
    }

    // Notifikasi untuk siswa: peminjaman yang sudah disetujui tapi belum dikonfirmasi diambil
    if (session.user.role === 'siswa' || session.user.role === 'umum') {
      // Cek peminjaman yang status approved (belum diambil)
      // Status akan berubah jadi 'borrowed' saat user konfirmasi pickup
      const [approvedBorrowings] = await pool.execute(
        `SELECT b.*, bk.title, bk.author
         FROM borrowings b
         JOIN books bk ON b.book_id = bk.id
         WHERE b.user_id = ? 
         AND b.status = 'approved'
         ORDER BY b.updated_at DESC
         LIMIT 10`,
        [session.user.id]
      );

      for (const borrowing of approvedBorrowings) {
        notifications.push({
          id: `approved-${borrowing.id}`,
          type: 'approved',
          title: 'Peminjaman Disetujui',
          message: `Buku "${borrowing.title}" sudah disetujui. Konfirmasi jika buku sudah diambil.`,
          borrowingId: borrowing.id,
          createdAt: borrowing.updated_at,
        });
      }

      // Cek pesan/message yang belum dibaca (jika tabel messages ada)
      try {
        const [unreadMessages] = await pool.execute(
          `SELECT m.*, bk.title as book_title
           FROM messages m
           LEFT JOIN borrowings b ON m.borrowing_id = b.id
           LEFT JOIN books bk ON b.book_id = bk.id
           WHERE m.receiver_id = ? 
           AND m.receiver_role = 'user'
           AND m.is_read = FALSE
           ORDER BY m.created_at DESC
           LIMIT 10`,
          [session.user.id]
        );

        for (const msg of unreadMessages) {
          notifications.push({
            id: `message-${msg.id}`,
            type: msg.type === 'cancellation_reason' ? 'cancellation' : msg.type,
            title: msg.type === 'cancellation_reason' 
              ? 'Alasan Pembatalan Peminjaman'
              : msg.type === 'warning'
              ? 'Peringatan'
              : 'Pesan Baru',
            message: msg.message,
            borrowingId: msg.borrowing_id,
            bookTitle: msg.book_title,
            createdAt: msg.created_at,
          });
        }
      } catch (error) {
        // Tabel messages belum dibuat, skip
        if (error.code !== 'ER_NO_SUCH_TABLE') {
          console.error('Error fetching messages:', error);
        }
      }

      // Notifikasi untuk peminjaman aktif dengan countdown
      const [activeBorrowings] = await pool.execute(
        `SELECT b.*, bk.title, bk.author
         FROM borrowings b
         JOIN books bk ON b.book_id = bk.id
         WHERE b.user_id = ? 
         AND b.status = 'borrowed'
         AND b.due_date > NOW()
         ORDER BY b.due_date ASC
         LIMIT 5`,
        [session.user.id]
      );

      for (const borrowing of activeBorrowings) {
        const dueDate = new Date(borrowing.due_date);
        const now = new Date();
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) { // Hanya notifikasi jika sisa 7 hari atau kurang
          notifications.push({
            id: `active-${borrowing.id}`,
            type: 'active',
            title: 'Pengingat Peminjaman',
            message: `Buku "${borrowing.title}" akan jatuh tempo dalam ${diffDays} hari`,
            borrowingId: borrowing.id,
            dueDate: borrowing.due_date,
            createdAt: borrowing.borrow_date,
          });
        }
      }
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { notifications: [] },
      { status: 200 }
    );
  }
}


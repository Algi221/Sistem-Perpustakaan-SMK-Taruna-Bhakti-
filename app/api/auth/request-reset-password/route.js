import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /api/auth/request-reset-password
 * User request reset password (kirim email verifikasi)
 */
export async function POST(request) {
  try {
    const { email, userType = 'user' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 });
    }

    if (!['user', 'staff', 'admin'].includes(userType)) {
      return NextResponse.json({ error: 'Tipe user tidak valid' }, { status: 400 });
    }

    // Cek apakah email terdaftar
    let user = null;
    let userId = null;

    if (userType === 'user') {
      const [users] = await pool.execute(
        'SELECT id, name, email FROM users WHERE email = ?',
        [email]
      );
      if (users.length > 0) {
        user = users[0];
        userId = users[0].id;
      }
    } else if (userType === 'staff') {
      const [staff] = await pool.execute(
        'SELECT id, name, email FROM staff WHERE email = ?',
        [email]
      );
      if (staff.length > 0) {
        user = staff[0];
        userId = staff[0].id;
      }
    } else if (userType === 'admin') {
      const [admins] = await pool.execute(
        'SELECT id, name, email FROM admin WHERE email = ?',
        [email]
      );
      if (admins.length > 0) {
        user = admins[0];
        userId = admins[0].id;
      }
    }

    // Jangan kasih tahu kalau email ga ada (security)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, kami akan mengirimkan link verifikasi'
      });
    }

    // Tidak perlu email verifikasi lagi, langsung buat request pending
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 jam

    // Cek apakah ada request pending yang belum expired
    const [existingRequests] = await pool.execute(
      `SELECT id FROM password_reset_requests 
       WHERE email = ? AND user_type = ? 
       AND status = 'pending' 
       AND expires_at > NOW()`,
      [email, userType]
    );

    let requestId;

    if (existingRequests.length > 0) {
      // Update request yang ada
      requestId = existingRequests[0].id;
      await pool.execute(
        `UPDATE password_reset_requests 
         SET expires_at = ?, updated_at = NOW()
         WHERE id = ?`,
        [expiresAt, requestId]
      );
    } else {
      // Buat request baru (tanpa verification token, langsung pending)
      // Generate dummy token karena kolom verification_token NOT NULL di schema
      // Token ini tidak digunakan karena kita skip email verification
      const dummyToken = crypto.randomBytes(32).toString('hex');
      
      const [result] = await pool.execute(
        `INSERT INTO password_reset_requests 
         (user_id, email, user_type, verification_token, email_verified, expires_at) 
         VALUES (?, ?, ?, ?, TRUE, ?)`,
        [userId, email, userType, dummyToken, expiresAt]
      );
      requestId = result.insertId;
    }

    // Buat notifikasi untuk admin tentang request reset password baru
    try {
      // Get all admin IDs
      const [adminList] = await pool.execute('SELECT id FROM admin');

      // Check if messages table exists
      const [tables] = await pool.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'messages'`,
        [process.env.DB_NAME || 'perpustakaan']
      );

      if (tables.length > 0 && requestId) {
        // Check if borrowing_id column allows NULL
        const [columns] = await pool.execute(
          `SELECT COLUMN_NAME, IS_NULLABLE 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'borrowing_id'`,
          [process.env.DB_NAME || 'perpustakaan']
        );

        const borrowingIdNullable = columns.length > 0 && columns[0].IS_NULLABLE === 'YES';

        for (const admin of adminList) {
          try {
            if (borrowingIdNullable) {
              // If borrowing_id can be NULL, use NULL for reset password notifications
              await pool.execute(
                `INSERT INTO messages (borrowing_id, sender_id, sender_role, receiver_id, receiver_role, message, type, is_read, created_at)
                 VALUES (NULL, ?, ?, ?, 'admin', ?, 'info', FALSE, NOW())`,
                [
                  userId || 0,
                  userType,
                  admin.id,
                  `User "${user.name}" (${email}) meminta reset password. Silakan tinjau di halaman Reset Password.`
                ]
              );
            } else {
              // Skip notification if borrowing_id is required
              console.log('Skipping notification: borrowing_id is required');
            }
          } catch (msgError) {
            // Skip if error, don't break the flow
            console.error('Error creating notification for admin:', admin.id, msgError.message);
          }
        }
      }
    } catch (notificationError) {
      // Messages table might not exist, that's okay
      if (notificationError.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error creating reset password notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Permintaan reset password telah dikirim. Menunggu persetujuan admin.',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error request reset password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
}







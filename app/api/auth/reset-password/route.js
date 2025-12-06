import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/reset-password
 * User reset password dengan token dari email
 */
export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token dan password baru diperlukan' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cari request dengan reset token
    const [requests] = await pool.execute(
      `SELECT * FROM password_reset_requests 
       WHERE reset_token = ? 
       AND status = 'approved'
       AND expires_at > NOW()`,
      [token]
    );

    if (requests.length === 0) {
      return NextResponse.json(
        { error: 'Token tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    const resetRequest = requests[0];

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di table sesuai user_type
    if (resetRequest.user_type === 'user') {
      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, resetRequest.user_id]
      );
    } else if (resetRequest.user_type === 'staff') {
      await pool.execute(
        'UPDATE staff SET password = ? WHERE id = ?',
        [hashedPassword, resetRequest.user_id]
      );
    } else if (resetRequest.user_type === 'admin') {
      await pool.execute(
        'UPDATE admin SET password = ? WHERE id = ?',
        [hashedPassword, resetRequest.user_id]
      );
    }

    // Update request status jadi completed
    await pool.execute(
      `UPDATE password_reset_requests 
       SET status = 'completed',
           reset_completed_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [resetRequest.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru.'
    });
  } catch (error) {
    console.error('Error reset password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mereset password' },
      { status: 500 }
    );
  }
}








import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * POST /api/auth/verify-email-token
 * Verify email token dari link yang dikirim
 */
export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token diperlukan' }, { status: 400 });
    }

    // Cari request dengan token ini
    const [requests] = await pool.execute(
      `SELECT * FROM password_reset_requests 
       WHERE verification_token = ? 
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

    // Cek apakah sudah di-verify
    if (resetRequest.email_verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        requestId: resetRequest.id,
        message: 'Email sudah diverifikasi'
      });
    }

    // Update status jadi email_verified = true
    await pool.execute(
      `UPDATE password_reset_requests 
       SET email_verified = TRUE, updated_at = NOW()
       WHERE id = ?`,
      [resetRequest.id]
    );

    return NextResponse.json({
      success: true,
      verified: true,
      requestId: resetRequest.id,
      message: 'Email berhasil diverifikasi. Admin akan meninjau permintaan Anda.'
    });
  } catch (error) {
    console.error('Error verify email token:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memverifikasi token' },
      { status: 500 }
    );
  }
}








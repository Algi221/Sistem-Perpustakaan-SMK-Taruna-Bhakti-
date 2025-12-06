import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/auth/check-reset-status
 * Check status reset password request untuk email tertentu
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userType = searchParams.get('userType') || 'user';

    if (!email) {
      return NextResponse.json(
        { error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    // Cek request terbaru untuk email ini
    const [requests] = await pool.execute(
      `SELECT id, status, email_verified, reset_token, expires_at, created_at, admin_approved_at
       FROM password_reset_requests 
       WHERE email = ? 
       AND user_type = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, userType]
    );

    if (requests.length === 0) {
      return NextResponse.json({
        hasRequest: false
      });
    }

    const resetRequest = requests[0];

    return NextResponse.json({
      hasRequest: true,
      requestId: resetRequest.id,
      status: resetRequest.status,
      emailVerified: resetRequest.email_verified,
      resetToken: resetRequest.reset_token,
      expiresAt: resetRequest.expires_at,
      createdAt: resetRequest.created_at,
      approvedAt: resetRequest.admin_approved_at
    });
  } catch (error) {
    console.error('Error check reset status:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}


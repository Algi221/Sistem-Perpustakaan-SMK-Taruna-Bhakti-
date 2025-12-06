import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/auth/check-approved-reset
 * Check apakah ada approved reset password request untuk email tertentu
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    // Cek apakah ada approved request yang belum di-reset (belum completed)
    const [requests] = await pool.execute(
      `SELECT id, reset_token, expires_at, user_type, user_id, status
       FROM password_reset_requests 
       WHERE email = ? 
       AND status = 'approved'
       AND expires_at > NOW()
       ORDER BY admin_approved_at DESC
       LIMIT 1`,
      [email]
    );

    console.log(`Check approved reset for email: ${email}, Found: ${requests.length} requests`);

    if (requests.length === 0) {
      return NextResponse.json({
        hasApprovedRequest: false
      });
    }

    const resetRequest = requests[0];
    
    // Pastikan reset_token ada
    if (!resetRequest.reset_token) {
      console.log('Reset token is null for request:', resetRequest.id);
      return NextResponse.json({
        hasApprovedRequest: false
      });
    }

    console.log('Returning approved request with token:', resetRequest.reset_token.substring(0, 10) + '...');

    return NextResponse.json({
      hasApprovedRequest: true,
      requestId: resetRequest.id,
      resetToken: resetRequest.reset_token,
      userType: resetRequest.user_type,
      userId: resetRequest.user_id
    });
  } catch (error) {
    console.error('Error check approved reset:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}


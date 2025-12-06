import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import crypto from 'crypto';

/**
 * PATCH /api/admin/password-reset-requests/[id]
 * Admin approve atau reject reset password request
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action, note } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
    }

    // Ambil request
    const [requests] = await pool.execute(
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
       WHERE prr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return NextResponse.json({ error: 'Request tidak ditemukan' }, { status: 404 });
    }

    const resetRequest = requests[0];

    if (action === 'approve') {
      // Jika email belum diverifikasi, auto-verify saat approve
      if (!resetRequest.email_verified) {
        await pool.execute(
          `UPDATE password_reset_requests 
           SET email_verified = TRUE
           WHERE id = ?`,
          [id]
        );
      }
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 jam

      // Update request
      await pool.execute(
        `UPDATE password_reset_requests 
         SET status = 'approved',
             admin_id = ?,
             admin_approved_at = NOW(),
             admin_note = ?,
             reset_token = ?,
             expires_at = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [session.user.id, note || null, resetToken, expiresAt, id]
      );

      return NextResponse.json({
        success: true,
        message: 'Permintaan reset password disetujui. User dapat langsung reset password di modal yang sama.',
        adminId: session.user.id
      });
    } else {
      // Reject
      await pool.execute(
        `UPDATE password_reset_requests 
         SET status = 'rejected',
             admin_id = ?,
             admin_approved_at = NOW(),
             admin_note = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [session.user.id, note || 'Permintaan ditolak', id]
      );

      return NextResponse.json({
        success: true,
        message: 'Permintaan reset password ditolak'
      });
    }
  } catch (error) {
    console.error('Error update password reset request:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

/**
 * GET /api/admin/password-reset-requests
 * Ambil semua password reset requests untuk admin
 */
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Jika status tidak diberikan atau 'all', ambil pending dan approved (untuk history)
    // Jika status diberikan, filter sesuai status tersebut
    let query, params;
    
    if (!status || status === 'all') {
      // Ambil pending dan approved untuk menampilkan history
      query = `SELECT prr.*,
       CASE 
         WHEN prr.user_type = 'user' THEN u.name
         WHEN prr.user_type = 'staff' THEN s.name
         WHEN prr.user_type = 'admin' THEN a.name
       END as user_name,
       admin.name as admin_name
       FROM password_reset_requests prr
       LEFT JOIN users u ON prr.user_type = 'user' AND prr.user_id = u.id
       LEFT JOIN staff s ON prr.user_type = 'staff' AND prr.user_id = s.id
       LEFT JOIN admin a ON prr.user_type = 'admin' AND prr.user_id = a.id
       LEFT JOIN admin ON prr.admin_id = admin.id
       WHERE prr.status IN ('pending', 'approved', 'rejected', 'completed')
       ORDER BY 
         CASE WHEN prr.status = 'pending' THEN 0 ELSE 1 END,
         prr.created_at DESC`;
      params = [];
    } else {
      // Filter berdasarkan status tertentu
      query = `SELECT prr.*,
       CASE 
         WHEN prr.user_type = 'user' THEN u.name
         WHEN prr.user_type = 'staff' THEN s.name
         WHEN prr.user_type = 'admin' THEN a.name
       END as user_name,
       admin.name as admin_name
       FROM password_reset_requests prr
       LEFT JOIN users u ON prr.user_type = 'user' AND prr.user_id = u.id
       LEFT JOIN staff s ON prr.user_type = 'staff' AND prr.user_id = s.id
       LEFT JOIN admin a ON prr.user_type = 'admin' AND prr.user_id = a.id
       LEFT JOIN admin ON prr.admin_id = admin.id
       WHERE prr.status = ?
       ORDER BY prr.created_at DESC`;
      params = [status];
    }

    const [requests] = await pool.execute(query, params);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error get password reset requests:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    );
  }
}







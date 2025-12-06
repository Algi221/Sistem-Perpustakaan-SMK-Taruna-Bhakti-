import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import ResetPasswordRequestsClient from '@/components/admin/ResetPasswordRequestsClient';

async function getResetPasswordRequests() {
  try {
    const [requests] = await pool.execute(
      `SELECT prr.*,
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
         prr.created_at DESC`
    );
    return { requests, error: null };
  } catch (error) {
    console.error('Error get reset password requests:', error);
    const isConnectionError = error.code === 'ECONNREFUSED' || error.errno === -4078;
    return { 
      requests: [], 
      error: isConnectionError 
        ? 'DATABASE_CONNECTION_ERROR' 
        : 'DATABASE_ERROR' 
    };
  }
}

export default async function ResetPasswordRequestsPage() {
  const session = await getSession();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const { requests, error } = await getResetPasswordRequests();

  return <ResetPasswordRequestsClient initialRequests={requests} dbError={error} />;
}







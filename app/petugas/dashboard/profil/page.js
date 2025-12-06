import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Profil from '@/components/staff/Profil';

async function getUserData(userId, role) {
  try {
    if (role === 'admin') {
      const [admins] = await pool.execute(
        'SELECT id, name, email, created_at FROM admin WHERE id = ?',
        [userId]
      );
      // Try to get profile_image separately if column exists
      try {
        const [adminWithImage] = await pool.execute(
          'SELECT profile_image FROM admin WHERE id = ?',
          [userId]
        );
        return admins[0] ? { ...admins[0], profile_image: adminWithImage[0]?.profile_image || null, role: 'admin' } : null;
      } catch {
        return admins[0] ? { ...admins[0], profile_image: null, role: 'admin' } : null;
      }
    } else if (role === 'staff') {
      const [staff] = await pool.execute(
        'SELECT id, name, email, phone, created_at FROM staff WHERE id = ?',
        [userId]
      );
      // Try to get profile_image separately if column exists
      try {
        const [staffWithImage] = await pool.execute(
          'SELECT profile_image FROM staff WHERE id = ?',
          [userId]
        );
        return staff[0] ? { ...staff[0], profile_image: staffWithImage[0]?.profile_image || null, role: 'staff' } : null;
      } catch {
        return staff[0] ? { ...staff[0], profile_image: null, role: 'staff' } : null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function getBorrowingStats(userId) {
  try {
    const [totalBorrowings] = await pool.execute(
      'SELECT COUNT(*) as total FROM borrowings WHERE user_id = ?',
      [userId]
    );
    const [approvedBorrowings] = await pool.execute(
      "SELECT COUNT(*) as total FROM borrowings WHERE user_id = ? AND status = 'approved'",
      [userId]
    );
    const [activeBorrowings] = await pool.execute(
      "SELECT COUNT(*) as total FROM borrowings WHERE user_id = ? AND status IN ('approved', 'borrowed')",
      [userId]
    );
    return {
      total: totalBorrowings[0]?.total || 0,
      approved: approvedBorrowings[0]?.total || 0,
      active: activeBorrowings[0]?.total || 0
    };
  } catch (error) {
    console.error('Error fetching borrowing stats:', error);
    return { total: 0, approved: 0, active: 0 };
  }
}

export default async function ProfilPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const userData = await getUserData(session.user.id, session.user.role);
  const stats = await getBorrowingStats(session.user.id);

  if (!userData) {
    redirect('/login');
  }

  return <Profil userData={userData} stats={stats} />;
}


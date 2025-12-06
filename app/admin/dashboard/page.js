import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import AdminDashboardClient from './dashboard-client';

async function getStaff() {
  try {
    const [staff] = await pool.execute(
      'SELECT * FROM staff ORDER BY created_at DESC'
    );
    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

async function getUsers() {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function getRecentBorrowings() {
  try {
    const [borrowings] = await pool.execute(
      `SELECT b.*, 
       u.name as user_name, u.email as user_email,
       bk.title, bk.author, bk.image_url
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       ORDER BY b.created_at DESC
       LIMIT 20`
    );
    return borrowings;
  } catch (error) {
    console.error('Error fetching recent borrowings:', error);
    return [];
  }
}

async function getRecentActivities() {
  try {
    // Get recent staff activities (approve/reject borrowings)
    const [activities] = await pool.execute(
      `SELECT 
        'approve' as type,
        b.updated_at as created_at,
        CONCAT('Petugas menyetujui peminjaman: ', bk.title, ' oleh ', u.name) as description
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status = 'approved' AND b.updated_at IS NOT NULL
       
       UNION ALL
       
       SELECT 
        'reject' as type,
        b.updated_at as created_at,
        CONCAT('Petugas menolak peminjaman: ', bk.title, ' oleh ', u.name) as description
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status = 'rejected' AND b.updated_at IS NOT NULL
       
       ORDER BY created_at DESC
       LIMIT 20`
    );
    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/login');
  }

  const staff = await getStaff();
  const users = await getUsers();
  const recentBorrowings = await getRecentBorrowings();
  const recentActivities = await getRecentActivities();

  return (
    <AdminDashboardClient
      staff={staff}
      users={users}
      recentBorrowings={recentBorrowings}
      recentActivities={recentActivities}
    />
  );
}


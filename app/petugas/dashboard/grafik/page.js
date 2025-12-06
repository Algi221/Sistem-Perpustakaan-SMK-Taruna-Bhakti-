import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import StaffCharts from '@/components/staff/StaffCharts';

async function getStats() {
  try {
    const [totalBooks] = await pool.execute('SELECT COUNT(*) as total FROM books');
    const [totalBorrowings] = await pool.execute('SELECT COUNT(*) as total FROM borrowings');
    const [pendingBorrowings] = await pool.execute("SELECT COUNT(*) as total FROM borrowings WHERE status = 'pending'");
    const [activeBorrowings] = await pool.execute("SELECT COUNT(*) as total FROM borrowings WHERE status IN ('approved', 'borrowed')");
    
    // Get borrowings by status
    const [borrowingsByStatus] = await pool.execute(
      `SELECT status, COUNT(*) as count 
       FROM borrowings 
       GROUP BY status`
    );

    // Get borrowings by month (last 6 months)
    const [borrowingsByMonth] = await pool.execute(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM borrowings
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    // Get books by genre
    const [booksByGenre] = await pool.execute(
      `SELECT genre, COUNT(*) as count 
       FROM books 
       GROUP BY genre 
       ORDER BY count DESC 
       LIMIT 10`
    );

    return {
      totalBooks: totalBooks[0]?.total || 0,
      totalBorrowings: totalBorrowings[0]?.total || 0,
      pendingBorrowings: pendingBorrowings[0]?.total || 0,
      activeBorrowings: activeBorrowings[0]?.total || 0,
      borrowingsByStatus: borrowingsByStatus || [],
      borrowingsByMonth: borrowingsByMonth || [],
      booksByGenre: booksByGenre || []
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalBooks: 0,
      totalBorrowings: 0,
      pendingBorrowings: 0,
      activeBorrowings: 0,
      borrowingsByStatus: [],
      borrowingsByMonth: [],
      booksByGenre: []
    };
  }
}

export default async function GrafikPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const stats = await getStats();

  return <StaffCharts stats={stats} />;
}


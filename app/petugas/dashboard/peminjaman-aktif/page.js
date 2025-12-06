import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import PeminjamanAktif from '@/components/staff/PeminjamanAktif';

async function getBorrowings() {
  try {
    const [borrowings] = await pool.execute(
      `SELECT b.*, 
       u.name as user_name, u.email as user_email, u.phone as user_phone, u.address as user_address,
       bk.title, bk.author, bk.image_url, bk.genre
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.status IN ('approved', 'borrowed')
       ORDER BY b.borrow_date DESC, b.created_at DESC`
    );
    return borrowings;
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return [];
  }
}

export default async function PeminjamanAktifPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const borrowings = await getBorrowings();

  return <PeminjamanAktif initialBorrowings={borrowings} />;
}


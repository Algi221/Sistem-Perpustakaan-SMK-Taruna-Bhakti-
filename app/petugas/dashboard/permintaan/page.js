import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Permintaan from '@/components/staff/Permintaan';

async function getBorrowings() {
  try {
    const [borrowings] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, 
       bk.title, bk.author, bk.image_url,
       CASE 
         WHEN EXISTS (
           SELECT 1 FROM messages m 
           WHERE m.borrowing_id = b.id 
           AND m.type = 'cancellation_reason' 
           AND m.sender_role IN ('staff', 'admin')
         ) THEN 1 
         ELSE 0 
       END as has_cancellation_reason
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       ORDER BY b.created_at DESC`
    );
    return borrowings;
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return [];
  }
}

export default async function PermintaanPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const borrowings = await getBorrowings();

  return <Permintaan initialBorrowings={borrowings} />;
}


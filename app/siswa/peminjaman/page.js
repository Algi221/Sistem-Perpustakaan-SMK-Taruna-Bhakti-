import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import PeminjamanPageClient from './components/PeminjamanPageClient';

async function getBorrowings(userId) {
  try {
    const [borrowings] = await pool.execute(
      `SELECT b.*, bk.title, bk.author, bk.image_url, bk.genre, bk.id as book_id
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.user_id = ? 
       ORDER BY 
         CASE b.status
           WHEN 'pending' THEN 1
           WHEN 'approved' THEN 2
           WHEN 'borrowed' THEN 3
           WHEN 'returned' THEN 4
           WHEN 'rejected' THEN 5
           ELSE 6
         END,
         b.created_at DESC`,
      [userId]
    );
    
    // Calculate fine for returned borrowings if not already calculated
    for (let borrowing of borrowings) {
      if (borrowing.status === 'returned' && borrowing.due_date && (!borrowing.fine_amount || borrowing.fine_amount === 0)) {
        const { calculateBorrowingFine } = await import('@/lib/fineCalculator');
        const fine = calculateBorrowingFine(borrowing.due_date, borrowing.return_date);
        if (fine.fineAmount > 0) {
          await pool.execute(
            `UPDATE borrowings SET fine_amount = ?, fine_days = ? WHERE id = ?`,
            [fine.fineAmount, fine.lateDays, borrowing.id]
          );
          borrowing.fine_amount = fine.fineAmount;
          borrowing.fine_days = fine.lateDays;
        }
      }
    }
    return borrowings;
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return [];
  }
}

export default async function PeminjamanPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const borrowings = await getBorrowings(session.user.id);

  return <PeminjamanPageClient borrowings={borrowings} />;
}


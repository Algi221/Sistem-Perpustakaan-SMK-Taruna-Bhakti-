import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { enrichBooksWithAvailableStock } from '@/lib/bookUtils';
import HomePageClient from './components/HomePageClient';

async function getBorrowings(userId) {
  try {
    const [borrowings] = await pool.execute(
      `SELECT b.*, bk.title, bk.author, bk.image_url, bk.genre 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return borrowings;
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return [];
  }
}

async function getTrendingBooks() {
  try {
    // Buku trending berdasarkan jumlah peminjaman terbanyak
    const [books] = await pool.execute(
      `SELECT b.*, COUNT(br.id) as borrow_count
       FROM books b
       LEFT JOIN borrowings br ON b.id = br.book_id
       GROUP BY b.id
       ORDER BY borrow_count DESC, b.created_at DESC
       LIMIT 10`
    );
    // Enrich books with calculated available stock
    return await enrichBooksWithAvailableStock(books);
  } catch (error) {
    console.error('Error fetching trending books:', error);
    return [];
  }
}

export default async function HomePage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const borrowings = await getBorrowings(session.user.id);
  const trendingBooks = await getTrendingBooks();

  return <HomePageClient borrowings={borrowings || []} trendingBooks={trendingBooks || []} />;
}

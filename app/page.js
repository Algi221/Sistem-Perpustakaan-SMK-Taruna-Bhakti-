import pool from '@/lib/db';
import LandingPageClient from '@/components/landing/LandingPageClient';

async function getBooks() {
  try {
    const [books] = await pool.execute(
      'SELECT * FROM books ORDER BY created_at DESC LIMIT 50'
    );
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
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
    return books;
  } catch (error) {
    console.error('Error fetching trending books:', error);
    return [];
  }
}

async function getGenres() {
  try {
    const [genres] = await pool.execute(
      'SELECT DISTINCT genre FROM books ORDER BY genre'
    );
    return genres.map(g => g.genre);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

async function getBookStats() {
  try {
    const [totalBooks] = await pool.execute('SELECT COUNT(*) as total FROM books');
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
    return {
      totalBooks: totalBooks[0]?.total || 0,
      totalUsers: totalUsers[0]?.total || 0
    };
  } catch (error) {
    return { totalBooks: 0, totalUsers: 0 };
  }
}

export default async function Home() {
  const books = await getBooks();
  const trendingBooks = await getTrendingBooks();
  const genres = await getGenres();
  const stats = await getBookStats();

  return (
    <LandingPageClient 
      books={books}
      trendingBooks={trendingBooks}
      genres={genres}
      stats={stats}
    />
  );
}

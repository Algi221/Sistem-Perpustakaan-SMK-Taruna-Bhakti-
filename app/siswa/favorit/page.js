import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { enrichBooksWithAvailableStock } from '@/lib/bookUtils';
import BookCard from '@/components/books/BookCard';

async function getFavoriteBooks(userId) {
  try {
    const [favorites] = await pool.execute(
      `SELECT b.* FROM books b
       JOIN favorites f ON b.id = f.book_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    // Enrich books with calculated available stock
    return await enrichBooksWithAvailableStock(favorites);
  } catch (error) {
    console.error('Error fetching favorite books:', error);
    return [];
  }
}

export default async function FavoritPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const books = await getFavoriteBooks(session.user.id);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buku Favorit</h1>
        <p className="text-gray-600 dark:text-gray-400">Buku yang telah Anda tandai sebagai favorit</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Belum ada buku favorit</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Tambahkan buku ke favorit untuk melihatnya di sini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}


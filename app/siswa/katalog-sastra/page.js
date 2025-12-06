import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { enrichBooksWithAvailableStock } from '@/lib/bookUtils';
import BookCard from '@/components/books/BookCard';

async function getLiteraryBooks() {
  try {
    const literaryGenres = ['Fiksi', 'Sastra', 'Puisi', 'Drama', 'Novel', 'Cerpen'];
    const placeholders = literaryGenres.map(() => '?').join(',');
    
    const [books] = await pool.execute(
      `SELECT * FROM books WHERE genre IN (${placeholders}) ORDER BY created_at DESC`,
      literaryGenres
    );
    // Enrich books with calculated available stock
    return await enrichBooksWithAvailableStock(books);
  } catch (error) {
    console.error('Error fetching literary books:', error);
    return [];
  }
}

export default async function KatalogSastraPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const books = await getLiteraryBooks();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Katalog Sastra</h1>
        <p className="text-gray-600 dark:text-gray-400">Koleksi buku sastra, fiksi, dan karya sastra lainnya</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Tidak ada buku sastra ditemukan.</p>
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


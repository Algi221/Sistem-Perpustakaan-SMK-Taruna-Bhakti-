import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { enrichBooksWithAvailableStock } from '@/lib/bookUtils';
import BookCard from '@/components/books/BookCard';
import Link from 'next/link';

async function getBooks(genre = null, search = null) {
  try {
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (genre) {
      query += ' AND genre = ?';
      params.push(genre);
    }

    if (search) {
      query += ' AND title LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam);
    }

    query += ' ORDER BY created_at DESC';

    const [books] = await pool.execute(query, params);
    // Enrich books with calculated available stock
    return await enrichBooksWithAvailableStock(books);
  } catch (error) {
    console.error('Error fetching books:', error);
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

export default async function KoleksiPage({ searchParams }) {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const params = await searchParams;
  const genre = params?.genre || null;
  const search = params?.search || null;
  const books = await getBooks(genre, search);
  const genres = await getGenres();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-6 animate-fade-in transition-colors duration-300">
      <div className="mb-6 md:mb-8 animate-slide-in">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {search ? `Hasil Pencarian: "${search}"` : 'Daftar Koleksi'}
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {search 
            ? `Ditemukan ${books.length} buku dengan nama "${search}"`
            : 'Jelajahi semua koleksi buku yang tersedia'
          }
        </p>
        {search && (
          <Link
            href="/siswa/koleksi"
            className="inline-block mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold underline"
          >
            ← Kembali ke semua koleksi
          </Link>
        )}
      </div>

      {/* Genre Filter */}
      <div className="mb-4 md:mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-in">
        <Link
          href={search ? `/siswa/koleksi?search=${encodeURIComponent(search)}` : '/siswa/koleksi'}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-all whitespace-nowrap hover:scale-105 active:scale-95 ${
            !genre
              ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Semua
        </Link>
        {genres.map((g, idx) => {
          const href = search 
            ? `/siswa/koleksi?genre=${encodeURIComponent(g)}&search=${encodeURIComponent(search)}`
            : `/siswa/koleksi?genre=${encodeURIComponent(g)}`;
          return (
            <Link
              key={g}
              href={href}
              className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-all whitespace-nowrap hover:scale-105 active:scale-95 animate-fade-in ${
                genre === g
                  ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {g}
            </Link>
          );
        })}
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl animate-fade-in transition-colors duration-300">
          <div className="text-6xl mb-4 animate-float">📚</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {search 
              ? `Tidak ada buku ditemukan dengan nama "${search}"`
              : 'Tidak ada buku ditemukan.'
            }
          </p>
          {search && (
            <Link
              href="/siswa/koleksi"
              className="inline-block mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold underline"
            >
              Lihat semua koleksi buku
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {books.map((book, index) => (
            <div
              key={book.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllTranslations } from '@/lib/i18n';

export default function KeranjangPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getAllTranslations(language);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchCartBooks();
  }, [session]);

  const fetchCartBooks = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (response.ok) {
        setBooks(books.filter(b => b.id !== bookId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const borrowAll = async () => {
    if (books.length === 0) return;
    
    setBorrowing(true);
    try {
      const borrowPromises = books.map(book =>
        fetch('/api/borrowings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: book.id,
            borrowDate: new Date().toISOString().split('T')[0],
            returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration: 14,
          }),
        })
      );

      await Promise.all(borrowPromises);
      
      // Clear cart
      for (const book of books) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: book.id }),
        });
      }

      router.push('/siswa/transaksi');
    } catch (error) {
      console.error('Error borrowing books:', error);
      alert('Terjadi kesalahan saat meminjam buku');
    } finally {
      setBorrowing(false);
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-6 flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 animate-fade-in transition-colors duration-300">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.cart}</h1>
        <p className="text-gray-600 dark:text-gray-400">Buku yang akan Anda pinjam</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl animate-fade-in transition-colors duration-300">
          <div className="text-6xl mb-4 animate-bounce">🛒</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Keranjang kosong</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Tambahkan buku ke keranjang untuk meminjam</p>
          <Link
            href="/siswa/koleksi"
            className="inline-block bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Jelajahi Buku
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6">
            {books.map((book, index) => (
              <div
                key={book.id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={book.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <button
                    onClick={() => removeFromCart(book.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 z-10"
                    title="Hapus dari keranjang"
                  >
                    <span className="text-sm">✕</span>
                  </button>
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                      book.available > 0
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {book.available > 0 ? t.available : t.unavailable}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-base mb-1 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 flex items-center gap-1">
                    <span className="text-gray-400 dark:text-gray-500">{t.by}</span>
                    <span className="font-medium">{book.author}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-blue-500 dark:bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                      {book.genre}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t.stock}: {book.available}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 animate-scale-in shadow-lg transition-colors duration-300">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Total: {books.length} buku</h3>
            <button
              onClick={borrowAll}
              disabled={borrowing || books.some(b => b.available === 0)}
              className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              {borrowing ? 'Memproses...' : 'Pinjam Semua'}
            </button>
            {books.some(b => b.available === 0) && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">Beberapa buku tidak tersedia</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

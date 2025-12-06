'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

export default function BookCardWithActions({ book }) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (session) {
      checkFavorite();
    }
  }, [session, book.id]);

  const checkFavorite = async () => {
    try {
      const response = await fetch(`/api/favorites?bookId=${book.id}`);
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };


  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      });
      const data = await response.json();
      setIsFavorite(data.isFavorite);
      
      // Show toast notification
      if (data.isFavorite) {
        showToast(`"${book.title}" ditambahkan ke favorit`, 'success');
      } else {
        showToast(`"${book.title}" dihapus dari favorit`, 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Gagal mengubah favorit. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };


  const isAvailable = book.available > 0;

  return (
    <Link href={`/books/${book.id}`}>
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 relative hover-lift">
        <div className="relative h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          {imageError || !book.image_url ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              <div className="text-center p-4">
                <span className="text-6xl mb-2 block">📚</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">No Image</span>
              </div>
            </div>
          ) : (
            <Image
              src={book.image_url}
              alt={book.title}
              fill
              className="object-cover object-center w-full h-full group-hover:scale-110 transition-transform duration-300"
              unoptimized
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            {session && (
              <button
                onClick={toggleFavorite}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
                title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
              >
                <span className="text-sm">{isFavorite ? '❤️' : '🤍'}</span>
              </button>
            )}
          </div>
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
              isAvailable 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {isAvailable ? 'Tersedia' : 'Habis'}
            </span>
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-base mb-1 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">oleh</span>
            <span className="font-medium">{book.author}</span>
          </p>
          
          <div className="flex items-center justify-between mb-2">
            <span className="inline-block bg-blue-500 dark:bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
              {book.genre}
            </span>
            {book.published_year && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {book.published_year}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Stok</span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              {book.available} / {book.stock}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

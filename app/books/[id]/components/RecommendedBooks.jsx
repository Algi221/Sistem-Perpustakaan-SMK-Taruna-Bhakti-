'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RecommendedBooks({ currentBookId, currentGenre }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedBooks();
  }, [currentBookId, currentGenre]);

  const fetchRecommendedBooks = async () => {
    try {
      const response = await fetch(`/api/books?genre=${encodeURIComponent(currentGenre)}`);
      const data = await response.json();
      // Filter out current book and limit to 8 books
      const filtered = data
        .filter(book => book.id !== currentBookId)
        .slice(0, 8);
      setBooks(filtered);
    } catch (error) {
      console.error('Error fetching recommended books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 transition-colors duration-300">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
          <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
          <span>Buku Rekomendasi Lainnya</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 transition-colors duration-300"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors duration-300"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
        <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
        <span>Buku Rekomendasi Lainnya</span>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {books.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`}>
            <div className="group cursor-pointer">
              <div className="relative aspect-[3/4] w-full mb-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                {book.image_url ? (
                  <Image
                    src={book.image_url}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                )}
              </div>
              <div className="mb-1">
                <span className="inline-block bg-blue-500 dark:bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold transition-colors duration-300">
                  {book.genre}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {book.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 transition-colors duration-300">
                {book.author}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


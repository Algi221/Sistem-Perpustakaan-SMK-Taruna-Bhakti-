'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function BookDetailInfo({ book, availabilityPercentage }) {
  const [imageError, setImageError] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [ratingData, setRatingData] = useState({
    average: 0,
    total: 0
  });

  useEffect(() => {
    // Fetch rating data for this book
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/reviews?bookId=${book.id}`);
        if (response.ok) {
          const data = await response.json();
          setRatingData(data.statistics || {
            average: 0,
            total: 0
          });
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
      }
    };

    if (book?.id) {
      fetchRating();
    }
  }, [book?.id]);

  // Generate call number from author and genre
  const generateCallNumber = () => {
    if (!book.author) return '-';
    const authorInitial = book.author.charAt(0).toUpperCase();
    const genreCode = book.genre ? book.genre.substring(0, 3).toUpperCase() : 'GEN';
    return `813 ${authorInitial} ${genreCode.toLowerCase()}`;
  };

  // Calculate pages from description or use default
  const getPhysicalDescription = () => {
    // Try to extract pages from description or use default
    const pageMatch = book.description?.match(/(\d+)\s*(?:halaman|pages|hal)/i);
    if (pageMatch) {
      return `${pageMatch[1]} halaman; 20 cm`;
    }
    return '368 halaman; 20 cm'; // Default
  };

  return (
    <>
      {/* Book Cover */}
      <div className="md:w-2/5 bg-white dark:bg-gray-800 p-6 md:p-8 flex items-center justify-center transition-colors duration-300">
        <div className="relative w-full max-w-sm group">
          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-600 transition-colors duration-300">
          {imageError || !book.image_url ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
              <div className="text-center p-8">
                <span className="text-9xl mb-4 block">📚</span>
                <span className="text-lg text-gray-600 dark:text-gray-400 font-semibold">No Image Available</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{book.title}</p>
              </div>
            </div>
          ) : (
              <>
            <Image
              src={book.image_url}
              alt={book.title}
              fill
                  className="object-contain object-center w-full h-full"
              unoptimized
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
                {/* Zoom Icon */}
                <button
                  onClick={() => setImageZoomed(true)}
                  className="absolute bottom-3 right-3 bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-700 rounded-full p-2.5 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Zoom image"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </button>
              </>
          )}
          </div>
        </div>
      </div>

      {/* Book Details */}
      <div className="md:w-3/5 p-6 md:p-8 lg:p-10 transition-colors duration-300">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors duration-300">
            {book.title}
          </h1>

        {/* Author and Editor */}
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
            <span className="font-semibold">{book.author}</span>
          <span className="text-gray-500 dark:text-gray-400"> (Pengarang)</span>
          {/* Editor would be added if available in database */}
          </p>
          
        {/* Genre Tag and Rating */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <span className="bg-red-500 dark:bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300">
              {book.genre}
            </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.round(ratingData.average)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`} 
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            {ratingData.total > 0 ? (
              <>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  {ratingData.average.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  ({ratingData.total} {ratingData.total === 1 ? 'Ulasan' : 'Ulasan'})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Belum ada ulasan
              </span>
            )}
          </div>
        </div>

        {/* Book Info Table */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <tbody className="space-y-2">
          {book.published_year && (
                <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3 transition-colors duration-300">Edisi:</td>
                  <td className="py-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">Cetakan ketiga</td>
                </tr>
          )}
          {book.publisher && (
                <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3 transition-colors duration-300">Penerbit:</td>
                  <td className="py-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    {book.publisher}
                    {book.published_year && `, ${book.published_year}`}
                  </td>
                </tr>
              )}
              <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3 transition-colors duration-300">Deskripsi Fisik:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">{getPhysicalDescription()}</td>
              </tr>
              {book.isbn && (
                <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3 transition-colors duration-300">ISBN:</td>
                  <td className="py-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">{book.isbn}</td>
                </tr>
              )}
              <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3 transition-colors duration-300">Subjek:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">{book.genre}</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3 transition-colors duration-300">Bahasa:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200 transition-colors duration-300">Indonesia</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 w-1/3 transition-colors duration-300">Call Number:</td>
                <td className="py-2 text-gray-800 dark:text-gray-200 font-mono transition-colors duration-300">{generateCallNumber()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Availability Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${book.available > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">Tersedia di:</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            {book.available > 0 ? (
              <span className="text-green-600 dark:text-green-400 font-semibold">{book.available} dari {book.stock} eksemplar tersedia</span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-semibold">Tidak tersedia</span>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {imageZoomed && book.image_url && !imageError && (
            <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageZoomed(false)}
        >
          <button
            onClick={() => setImageZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close zoom"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={book.image_url}
              alt={book.title}
              fill
              className="object-contain"
              unoptimized
              sizes="90vw"
            />
          </div>
          </div>
        )}
    </>
  );
}


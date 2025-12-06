'use client';

import { useState, useEffect } from 'react';
import BorrowButton from './BorrowButton';
import { Star, Share2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function BookActionButtons({ bookId, book, available, userBorrowing }) {
  const { showToast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Lihat buku "${book.title}" oleh ${book.author}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowShareMenu(true);
      setTimeout(() => setShowShareMenu(false), 2000);
    }
  };

  // Check if book is already favorited
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/favorites?bookId=${bookId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorite || false);
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      } finally {
        setCheckingFavorite(false);
      }
    };

    checkFavorite();
  }, [bookId]);

  const handleFavorite = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorite);
        
        // Show toast notification
        if (data.isFavorite) {
          showToast(`"${book.title}" ditambahkan ke favorit`, 'success');
        } else {
          showToast(`"${book.title}" dihapus dari favorit`, 'success');
        }
      } else {
        const error = await response.json();
        console.error('Error toggling favorite:', error);
        showToast(error.error || 'Gagal mengubah favorit', 'error');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex-1 sm:flex-initial px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <Share2 className="w-5 h-5" />
        <span>Bagikan buku ini</span>
      </button>

      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        disabled={loading || checkingFavorite}
        className={`flex-1 sm:flex-initial px-6 py-3 border-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
          isFavorited
            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        )}
        <span>
          {isFavorited ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
        </span>
      </button>

      {/* Borrow Button */}
      <div className="flex-1 sm:flex-initial min-w-[200px]">
        <BorrowButton bookId={bookId} available={available} book={book} userBorrowing={userBorrowing} />
      </div>

      {/* Share Success Message */}
      {showShareMenu && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Link berhasil disalin!
        </div>
      )}
    </div>
  );
}


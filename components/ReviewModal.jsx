'use client';

import { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ReviewModal({ isOpen, onClose, bookId, borrowingId, onReviewSubmitted }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('Silakan beri rating terlebih dahulu', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          borrowingId,
          rating,
          review: review.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Ulasan berhasil ditambahkan!', 'success');
        setRating(0);
        setReview('');
        setHoveredRating(0);
        onClose();
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        showToast(data.error || 'Gagal menambahkan ulasan', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Beri Ulasan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    } transition-colors`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {rating === 5 && 'Sangat Baik'}
                  {rating === 4 && 'Baik'}
                  {rating === 3 && 'Cukup'}
                  {rating === 2 && 'Kurang'}
                  {rating === 1 && 'Sangat Kurang'}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ulasan (Opsional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Bagikan pengalaman Anda membaca buku ini..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={5}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {review.length}/500 karakter
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Ulasan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



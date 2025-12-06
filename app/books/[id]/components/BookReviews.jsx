'use client';

import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';

export default function BookReviews({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [ratingData, setRatingData] = useState({
    average: 0,
    total: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?bookId=${bookId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setRatingData(data.statistics || {
          average: 0,
          total: 0,
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (count) => {
    if (ratingData.total === 0) return 0;
    return (count / ratingData.total) * 100;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 transition-colors duration-300">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
        <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
        <span>Ulasan</span>
        {ratingData.total > 0 && (
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({ratingData.total} {ratingData.total === 1 ? 'ulasan' : 'ulasan'})
          </span>
        )}
      </h3>
      
      {ratingData.total === 0 ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Belum ada ulasan untuk buku ini</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Rating Summary */}
            <div className="flex flex-col items-center justify-center md:items-start">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {ratingData.average.toFixed(1)}/5
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(ratingData.average)
                        ? 'text-yellow-400 dark:text-yellow-500 fill-yellow-400 dark:fill-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {ratingData.total} {ratingData.total === 1 ? 'Ulasan' : 'Ulasan'}
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingData.breakdown[stars] || 0;
                const percentage = getPercentage(count);
                
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">{stars}</span>
                      <Star className="w-4 h-4 text-yellow-400 dark:text-yellow-500 fill-yellow-400 dark:fill-yellow-500" />
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden transition-colors duration-300">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage > 0 ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right transition-colors duration-300">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {review.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {review.user_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 dark:text-yellow-500 fill-yellow-400 dark:fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.review && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {review.review}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


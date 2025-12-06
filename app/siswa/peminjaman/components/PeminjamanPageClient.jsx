'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import PeminjamanCard from './PeminjamanCard';
import ReturnBookModal from '@/components/ReturnBookModal';

export default function PeminjamanPageClient({ borrowings }) {
  const { language } = useLanguage();
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);

  // Group borrowings by status
  const groupedBorrowings = {
    pending: borrowings.filter(b => b.status === 'pending'),
    approved: borrowings.filter(b => b.status === 'approved'),
    borrowed: borrowings.filter(b => b.status === 'borrowed'),
    returned: borrowings.filter(b => b.status === 'returned'),
    rejected: borrowings.filter(b => b.status === 'rejected'),
  };

  const handleReturnClick = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setShowReturnModal(true);
  };

  const handleReturnSuccess = () => {
    setShowReturnModal(false);
    setSelectedBorrowing(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <span className="text-blue-600 dark:text-blue-400">📚</span>
            {t('borrowingDetails', language)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'id' 
              ? 'Kelola dan lihat detail semua peminjaman buku Anda'
              : 'Manage and view details of all your book borrowings'}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('pending', language)}</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{groupedBorrowings.pending.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('approved', language)}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{groupedBorrowings.approved.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('borrowed', language)}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{groupedBorrowings.borrowed.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('returned', language)}</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{groupedBorrowings.returned.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('rejected', language)}</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{groupedBorrowings.rejected.length}</p>
          </div>
        </div>

        {/* Pending Section */}
        {groupedBorrowings.pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-yellow-500">⏳</span>
              {t('waitingApproval', language)} ({groupedBorrowings.pending.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBorrowings.pending.map((borrowing, index) => (
                <div
                  key={borrowing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PeminjamanCard borrowing={borrowing} onReturnClick={handleReturnClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Section */}
        {groupedBorrowings.approved.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-blue-500">✅</span>
              {t('approved', language)} ({groupedBorrowings.approved.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBorrowings.approved.map((borrowing, index) => (
                <div
                  key={borrowing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PeminjamanCard borrowing={borrowing} onReturnClick={handleReturnClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Borrowed Section */}
        {groupedBorrowings.borrowed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-green-500">📖</span>
              {t('borrowed', language)} ({groupedBorrowings.borrowed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBorrowings.borrowed.map((borrowing, index) => (
                <div
                  key={borrowing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PeminjamanCard borrowing={borrowing} onReturnClick={handleReturnClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Returned Section */}
        {groupedBorrowings.returned.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-gray-500">📚</span>
              {t('returned', language)} ({groupedBorrowings.returned.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBorrowings.returned.map((borrowing, index) => (
                <div
                  key={borrowing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PeminjamanCard borrowing={borrowing} onReturnClick={handleReturnClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Section */}
        {groupedBorrowings.rejected.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-red-500">❌</span>
              {t('rejected', language)} ({groupedBorrowings.rejected.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBorrowings.rejected.map((borrowing, index) => (
                <div
                  key={borrowing.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PeminjamanCard borrowing={borrowing} onReturnClick={handleReturnClick} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {borrowings.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl animate-fade-in transition-colors duration-300">
            <div className="text-6xl mb-4 animate-float">📚</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">{t('noBorrowingRequests', language)}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">{t('allProcessed', language)}</p>
          </div>
        )}
      </div>

      {/* Return Book Modal */}
      <ReturnBookModal
        isOpen={showReturnModal}
        onClose={() => {
          setShowReturnModal(false);
          setSelectedBorrowing(null);
        }}
        borrowing={selectedBorrowing}
        onSuccess={handleReturnSuccess}
      />
    </div>
  );
}



'use client';

import { useState } from 'react';
import { X, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

export default function ReturnBookModal({ isOpen, onClose, borrowing, onSuccess }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !borrowing) return null;

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/borrowings/${borrowing.id}/return-request`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        const bookTitle = data.bookTitle || borrowing.title;
        showToast(`Permintaan pengembalian buku "${bookTitle}" telah dikirim. Menunggu konfirmasi petugas.`, 'success');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        showToast(data.error || 'Gagal mengirim permintaan pengembalian', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Kembalikan Buku
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Konfirmasi pengembalian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Informasi Penting
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Permintaan pengembalian akan dikirim ke petugas untuk konfirmasi. Pastikan buku dalam kondisi baik sebelum dikembalikan.
                </p>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Judul Buku</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {borrowing.title}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Penulis</p>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {borrowing.author}
              </p>
            </div>
            {borrowing.due_date && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Jatuh Tempo</p>
                <p className="text-base text-gray-700 dark:text-gray-300">
                  {new Date(borrowing.due_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Konfirmasi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


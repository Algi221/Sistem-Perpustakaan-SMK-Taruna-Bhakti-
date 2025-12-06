'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare, Send, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function CancellationReasons() {
  const { showToast } = useToast();
  const [pendingReasons, setPendingReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [reasons, setReasons] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);

  useEffect(() => {
    // Auto-check expired borrowings saat komponen mount
    checkExpiredBorrowings();
    fetchPendingReasons();
    
    // Refresh setiap 30 detik
    const interval = setInterval(() => {
      checkExpiredBorrowings();
      fetchPendingReasons();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkExpiredBorrowings = async () => {
    try {
      // Panggil API untuk check dan cancel expired borrowings
      await fetch('/api/borrowings/check-expired', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error checking expired borrowings:', error);
    }
  };

  const fetchPendingReasons = async () => {
    try {
      const response = await fetch('/api/borrowings/check-expired');
      if (response.ok) {
        const data = await response.json();
        setPendingReasons(data.pendingReasons || []);
      }
    } catch (error) {
      console.error('Error fetching pending reasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReason = async (borrowingId) => {
    const reason = reasons[borrowingId]?.trim();
    
    if (!reason || reason.length === 0) {
      showToast('Alasan pembatalan wajib diisi', 'error');
      return;
    }

    setSubmitting({ ...submitting, [borrowingId]: true });

    try {
      const response = await fetch(`/api/borrowings/${borrowingId}/cancel-reason`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Alasan pembatalan berhasil dikirim ke user', 'success');
        // Remove from list
        setPendingReasons(prev => prev.filter(b => b.id !== borrowingId));
        setReasons({ ...reasons, [borrowingId]: '' });
        setShowModal(false);
        setSelectedBorrowing(null);
      } else {
        showToast(data.error || 'Gagal mengirim alasan', 'error');
      }
    } catch (error) {
      console.error('Error submitting reason:', error);
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setSubmitting({ ...submitting, [borrowingId]: false });
    }
  };

  const openModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setReasons({ ...reasons, [borrowing.id]: reasons[borrowing.id] || '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (pendingReasons.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-2">
              Peminjaman yang Perlu Alasan Pembatalan
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-4">
              Ada {pendingReasons.length} peminjaman yang telah dibatalkan otomatis karena tidak diproses dalam 1 jam. 
              Silakan berikan alasan pembatalan kepada user.
            </p>
            
            <div className="space-y-3">
              {pendingReasons.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {borrowing.userName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Buku: <span className="font-medium">{borrowing.bookTitle}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Dibuat: {new Date(borrowing.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(borrowing)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Beri Alasan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk mengisi alasan */}
      {showModal && selectedBorrowing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Beri Alasan Pembatalan
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBorrowing(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-semibold">User:</span> {selectedBorrowing.userName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-semibold">Buku:</span> {selectedBorrowing.bookTitle}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Alasan Pembatalan *
              </label>
              <textarea
                value={reasons[selectedBorrowing.id] || ''}
                onChange={(e) => setReasons({ ...reasons, [selectedBorrowing.id]: e.target.value })}
                placeholder="Contoh: Buku sedang dalam perbaikan, stok habis, dll..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Alasan ini akan dikirim ke user sebagai notifikasi
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBorrowing(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleSubmitReason(selectedBorrowing.id)}
                disabled={submitting[selectedBorrowing.id] || !reasons[selectedBorrowing.id]?.trim()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting[selectedBorrowing.id] ? (
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
                    <span>Kirim Alasan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


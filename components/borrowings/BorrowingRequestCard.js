'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';

export default function BorrowingRequestCard({ borrowing, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleStatusChange = async (newStatus) => {
    // Only show confirm for reject, not for approve
    if (newStatus === 'rejected') {
      if (!confirm(`Apakah Anda yakin ingin menolak peminjaman "${borrowing.title}"?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      let response;
      
      // Use confirm-return API for return_requested -> returned
      if (borrowing.status === 'return_requested' && newStatus === 'returned') {
        response = await fetch(`/api/borrowings/${borrowing.id}/confirm-return`, {
          method: 'PATCH',
        });
      } else {
        response = await fetch(`/api/borrowings/${borrowing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      }

      if (response.ok) {
        const updated = await response.json();
        onUpdate({ ...borrowing, status: newStatus });
        
        // Show success toast
        const statusMessages = {
          'approved': `Peminjaman "${borrowing.title}" berhasil disetujui`,
          'borrowed': `Buku "${borrowing.title}" berhasil ditandai sebagai dipinjam`,
          'returned': `Pengembalian "${borrowing.title}" berhasil dikonfirmasi`,
          'rejected': `Peminjaman "${borrowing.title}" telah ditolak`
        };
        showToast(statusMessages[newStatus] || 'Status berhasil diperbarui', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Gagal memperbarui status', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan saat memperbarui status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Menunggu Persetujuan',
      'approved': 'Disetujui',
      'borrowed': 'Dipinjam',
      'return_requested': 'Menunggu Konfirmasi Pengembalian',
      'returned': 'Dikembalikan',
      'rejected': 'Ditolak'
    };
    return labels[status] || status;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-50 border-yellow-300', badge: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case 'approved':
        return { bg: 'bg-blue-50 border-blue-300', badge: 'bg-blue-100 text-blue-800', icon: '✅' };
      case 'borrowed':
        return { bg: 'bg-green-50 border-green-300', badge: 'bg-green-100 text-green-800', icon: '📖' };
      case 'return_requested':
        return { bg: 'bg-orange-50 border-orange-300', badge: 'bg-orange-100 text-orange-800', icon: '⏳' };
      case 'returned':
        return { bg: 'bg-gray-50 border-gray-300', badge: 'bg-gray-100 text-gray-800', icon: '📚' };
      case 'rejected':
        return { bg: 'bg-red-50 border-red-300', badge: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { bg: 'bg-gray-50 border-gray-300', badge: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  const statusConfig = getStatusConfig(borrowing.status);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${statusConfig.bg} dark:border-gray-700 transition-all hover:shadow-xl`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-40 h-56 md:h-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
          <Image
            src={borrowing.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
            alt={borrowing.title}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
            }}
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{borrowing.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">oleh {borrowing.author}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${statusConfig.badge}`}>
              <span>{statusConfig.icon}</span>
              <span>{getStatusLabel(borrowing.status)}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">👤 Peminjam</p>
              <p className="font-semibold text-gray-800 dark:text-white">{borrowing.user_name}</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📧 Email</p>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">{borrowing.user_email}</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📅 Tanggal Pinjam</p>
              <p className="font-semibold text-gray-800 dark:text-white">{borrowing.borrow_date ? new Date(borrowing.borrow_date).toLocaleDateString('id-ID') : '-'}</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">⏰ Jatuh Tempo</p>
              <p className="font-semibold text-gray-800 dark:text-white">{borrowing.due_date ? new Date(borrowing.due_date).toLocaleDateString('id-ID') : '-'}</p>
            </div>
          </div>

          {/* Show cancellation reason if rejected and has reason */}
          {borrowing.status === 'rejected' && borrowing.has_cancellation_reason && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Alasan Penolakan:</p>
              <p className="text-sm text-red-700 dark:text-red-400">{borrowing.notes || 'Alasan pembatalan telah diberikan kepada user'}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {/* Only show buttons if not rejected with reason */}
            {borrowing.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Setujui Peminjaman</span>
                  </>
                )}
              </button>
            )}

            {borrowing.status === 'approved' && (
              <button
                onClick={() => handleStatusChange('borrowed')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span>📖</span>
                    <span>Tandai sebagai Dipinjam</span>
                  </>
                )}
              </button>
            )}

            {borrowing.status === 'return_requested' && (
              <button
                onClick={() => handleStatusChange('returned')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Konfirmasi Pengembalian</span>
                  </>
                )}
              </button>
            )}

            {/* Show message if rejected with reason */}
            {borrowing.status === 'rejected' && borrowing.has_cancellation_reason && (
              <div className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Peminjaman ini telah ditolak dan alasan telah diberikan kepada user. Tidak dapat diubah lagi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


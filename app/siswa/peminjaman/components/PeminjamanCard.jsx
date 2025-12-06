'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, CheckCircle, XCircle, BookOpen, AlertTriangle, Star, CreditCard } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import ReviewModal from '@/components/ReviewModal';
import FinePaymentModal from '@/components/borrowings/FinePaymentModal';
import { calculateBorrowingFine, formatRupiah } from '@/lib/fineCalculator';

export default function PeminjamanCard({ borrowing, onReturnClick }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [fineInfo, setFineInfo] = useState(null);

  // Check if user has already reviewed this borrowing
  useEffect(() => {
    if (borrowing.status === 'returned') {
      const checkReview = async () => {
        try {
          const response = await fetch(`/api/reviews?bookId=${borrowing.book_id}`);
          if (response.ok) {
            const data = await response.json();
            const userReview = data.reviews?.find(
              (r) => r.borrowing_id === borrowing.id
            );
            if (userReview) {
              setHasReviewed(true);
            }
          }
        } catch (error) {
          console.error('Error checking review:', error);
        }
      };
      checkReview();
    }
  }, [borrowing.status, borrowing.book_id, borrowing.id]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-300',
          badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
          icon: '⏳',
          label: 'Menunggu Persetujuan',
          description: 'Menunggu persetujuan dari staff perpustakaan'
        };
      case 'approved':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-300',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
          icon: '✅',
          label: 'Disetujui',
          description: 'Buku sudah disetujui, siap untuk diambil'
        };
      case 'borrowed':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-300',
          badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
          icon: '📖',
          label: 'Dipinjam',
          description: 'Buku sedang Anda pinjam'
        };
      case 'return_requested':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-300',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
          icon: '⏳',
          label: 'Menunggu Konfirmasi',
          description: 'Menunggu konfirmasi pengembalian dari petugas'
        };
      case 'returned':
        return {
          bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-300',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
          icon: '📚',
          label: 'Dikembalikan',
          description: 'Buku sudah dikembalikan'
        };
      case 'rejected':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-300',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
          icon: '❌',
          label: 'Ditolak',
          description: 'Permintaan peminjaman ditolak'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-300',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
          icon: '📄',
          label: status,
          description: ''
        };
    }
  };

  const handlePickup = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Apakah Anda yakin buku telah diambil? Durasi peminjaman akan dimulai dari hari ini.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/borrowings/${borrowing.id}/pickup`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (response.ok) {
        const bookTitle = data.bookTitle || borrowing.title;
        showToast(`Buku "${bookTitle}" telah dikonfirmasi diambil!`, 'success');
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        showToast(data.error || 'Gagal memperbarui status', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReturnClick) {
      onReturnClick(borrowing);
    }
  };

  // Calculate fine if returned and has fine
  useEffect(() => {
    if (borrowing.status === 'returned' && borrowing.due_date) {
      const fine = calculateBorrowingFine(borrowing.due_date, borrowing.return_date);
      if (fine.fineAmount > 0) {
        setFineInfo({
          ...fine,
          fineAmount: borrowing.fine_amount || fine.fineAmount,
          fineDays: borrowing.fine_days || fine.lateDays,
          finePaid: borrowing.fine_paid || false,
        });
      } else {
        setFineInfo(null);
      }
    } else {
      setFineInfo(null);
    }
  }, [borrowing.status, borrowing.due_date, borrowing.return_date, borrowing.fine_amount, borrowing.fine_days, borrowing.fine_paid]);

  // Reset modal state when fine is paid or borrowing changes
  useEffect(() => {
    if (fineInfo?.finePaid || !fineInfo) {
      setShowFineModal(false);
    }
  }, [fineInfo]);

  const statusConfig = getStatusConfig(borrowing.status);
  const isOverdue = borrowing.due_date && new Date(borrowing.due_date) < new Date() && borrowing.status === 'borrowed';
  const daysRemaining = borrowing.due_date && borrowing.status === 'borrowed' 
    ? Math.ceil((new Date(borrowing.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${statusConfig.bg} transition-colors duration-300`}>
      <Link href={`/books/${borrowing.book_id}`}>
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={borrowing.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
            alt={borrowing.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            unoptimized
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
            }}
          />
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 ${statusConfig.badge}`}>
              <span>{statusConfig.icon}</span>
              <span>{statusConfig.label}</span>
            </span>
          </div>
          {isOverdue && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Terlambat</span>
              </span>
            </div>
          )}
          {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 3 && !isOverdue && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{daysRemaining} hari lagi</span>
              </span>
            </div>
          )}
        </div>
      </Link>
        
      <div className="p-5">
        <Link href={`/books/${borrowing.book_id}`}>
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {borrowing.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">oleh</span>
            <span className="font-medium">{borrowing.author}</span>
          </p>
        </Link>
        
        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Status Description */}
          <div className="text-xs text-gray-600 dark:text-gray-400 italic">
            {statusConfig.description}
          </div>

          {/* Dates Info */}
          <div className="space-y-2">
            {borrowing.borrow_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Pinjam:</span>
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(borrowing.borrow_date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}
            {borrowing.due_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Jatuh Tempo:</span>
                </span>
                <span className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {new Date(borrowing.due_date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}
            {borrowing.return_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Kembali:</span>
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(borrowing.return_date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            )}
            {daysRemaining !== null && daysRemaining > 0 && borrowing.status === 'borrowed' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Sisa Waktu:</span>
                </span>
                <span className={`font-semibold ${daysRemaining <= 3 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                  {daysRemaining} hari
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {borrowing.status === 'approved' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePickup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
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
                  <span>📦</span>
                  <span>Buku Telah Diambil</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Return Request Button */}
        {borrowing.status === 'borrowed' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReturnClick}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📚</span>
              <span>Kembalikan Buku</span>
            </button>
          </div>
        )}

        {/* Review Button for Returned Books */}
        {borrowing.status === 'returned' && !hasReviewed && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 dark:hover:from-yellow-700 dark:hover:to-orange-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              <span>Beri Ulasan</span>
            </button>
          </div>
        )}

        {/* Fine Payment Section */}
        {borrowing.status === 'returned' && fineInfo && fineInfo.fineAmount > 0 && (
          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-900 dark:text-red-300">
                  Denda Keterlambatan
                </span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatRupiah(fineInfo.fineAmount)}
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-400">
                Terlambat {fineInfo.fineDays} hari
              </p>
            </div>
            {!fineInfo.finePaid ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowFineModal(true);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Bayar Denda</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <CheckCircle className="w-5 h-5" />
                <span>Denda sudah dibayar</span>
              </div>
            )}
          </div>
        )}

        {/* Reviewed Badge */}
        {borrowing.status === 'returned' && hasReviewed && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Anda sudah memberikan ulasan</span>
            </div>
          </div>
        )}

        {/* Info Message */}
        {borrowing.status === 'pending' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Menunggu persetujuan staff perpustakaan
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        bookId={borrowing.book_id}
        borrowingId={borrowing.id}
        onReviewSubmitted={() => {
          setHasReviewed(true);
          router.refresh();
        }}
      />

      {/* Fine Payment Modal */}
      {showFineModal && fineInfo && !fineInfo.finePaid && fineInfo.fineAmount > 0 && (
        <FinePaymentModal
          borrowing={{ ...borrowing, fine_amount: fineInfo.fineAmount, fine_days: fineInfo.fineDays }}
          onClose={() => {
            setShowFineModal(false);
          }}
          onSuccess={() => {
            setFineInfo(prev => prev ? { ...prev, finePaid: true } : null);
            setShowFineModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}


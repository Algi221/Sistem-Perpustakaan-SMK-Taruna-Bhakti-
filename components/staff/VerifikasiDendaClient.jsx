'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, XCircle, Clock, CreditCard, User, BookOpen, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { formatRupiah } from '@/lib/fineCalculator';

export default function VerifikasiDendaClient({ initialPayments }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [payments, setPayments] = useState(initialPayments);
  const [loading, setLoading] = useState({});

  const handleVerify = async (borrowingId, action, note = '') => {
    if (loading[borrowingId]) return;

    setLoading(prev => ({ ...prev, [borrowingId]: true }));

    try {
      const response = await fetch(`/api/payments/verify/${borrowingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action, // 'approve' or 'reject'
          note,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          action === 'approve' 
            ? 'Pembayaran denda berhasil diverifikasi!' 
            : 'Pembayaran denda ditolak.',
          action === 'approve' ? 'success' : 'info'
        );
        
        // Remove from list
        setPayments(prev => prev.filter(p => p.id !== borrowingId));
        
        // Refresh page after a moment
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        console.error('Verification error:', data);
        showToast(
          data.error || data.message || 'Gagal memverifikasi pembayaran', 
          'error'
        );
      }
    } catch (error) {
      console.error('Verification request error:', error);
      showToast('Terjadi kesalahan saat memverifikasi', 'error');
    } finally {
      setLoading(prev => ({ ...prev, [borrowingId]: false }));
    }
  };

  if (payments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tidak Ada Pembayaran yang Perlu Diverifikasi
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Semua pembayaran denda telah diproses!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Verifikasi Pembayaran Denda
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verifikasi pembayaran denda yang telah dilakukan melalui Xendit
          </p>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Catatan Verifikasi
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Pastikan pembayaran sudah benar-benar diterima sebelum menyetujui. 
                  Anda dapat menolak jika ada ketidaksesuaian.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Menunggu Verifikasi</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{payments.length}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Denda</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatRupiah(payments.reduce((sum, p) => sum + (p.fine_amount || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rata-rata Denda</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatRupiah(
                    payments.length > 0 
                      ? payments.reduce((sum, p) => sum + (p.fine_amount || 0), 0) / payments.length 
                      : 0
                  )}
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-gray-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Book Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={payment.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
                        alt={payment.book_title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {payment.book_title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        oleh {payment.author}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        Menunggu Verifikasi
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Peminjam</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{payment.user_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Pembayaran</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {payment.fine_paid_at 
                              ? new Date(payment.fine_paid_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Terlambat</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {payment.fine_days} hari
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah Denda</p>
                          <p className="font-semibold text-red-600 dark:text-red-400 text-lg">
                            {formatRupiah(payment.fine_amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Xendit Info */}
                    {payment.xendit_invoice_id && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Invoice ID: <span className="font-mono">{payment.xendit_invoice_id}</span>
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleVerify(payment.id, 'approve')}
                        disabled={loading[payment.id]}
                        className="flex-1 md:flex-initial px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading[payment.id] ? (
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
                            <span>Setujui Pembayaran</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('Alasan penolakan (opsional):');
                          if (note !== null) {
                            handleVerify(payment.id, 'reject', note);
                          }
                        }}
                        disabled={loading[payment.id]}
                        className="flex-1 md:flex-initial px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


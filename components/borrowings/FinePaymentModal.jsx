'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CreditCard, CheckCircle } from 'lucide-react';
import { formatRupiah } from '@/lib/fineCalculator';

export default function FinePaymentModal({ borrowing, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isRedirecting = useRef(false);

  const handlePayment = async () => {
    if (loading || isRedirecting.current) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          borrowingId: borrowing.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Redirect to Xendit payment page
      if (data.invoiceUrl) {
        isRedirecting.current = true;
        onClose(); // Close modal before redirect
        window.location.href = data.invoiceUrl;
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading && !isRedirecting.current) {
      onClose();
    }
  };

  // Prevent modal from reopening after component unmounts
  useEffect(() => {
    return () => {
      isRedirecting.current = false;
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Bayar Denda</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-300 mb-1">
                  Denda Keterlambatan
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Buku terlambat dikembalikan selama <strong>{borrowing.fine_days} hari</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Judul Buku:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {borrowing.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Hari Keterlambatan:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {borrowing.fine_days} hari
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total Denda:
                  </span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatRupiah(borrowing.fine_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Catatan:</strong> Pembayaran akan diproses melalui Xendit. 
              Anda akan diarahkan ke halaman pembayaran yang aman.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Batal
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <CreditCard className="w-5 h-5" />
                <span>Bayar Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


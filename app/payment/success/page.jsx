'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, X } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const externalId = searchParams.get('external_id');
    const id = externalId || orderId;
    
    if (!id) {
      setStatus('error');
      return;
    }

    // Function to check payment status
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status/${encodeURIComponent(id)}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Payment status response:', data);
        
        // Handle error from Xendit API (but still use local status)
        if (data.error && data.error.includes('Failed to verify with Xendit')) {
          console.warn('Xendit API unavailable, using local status:', data.status);
          // Continue with local status even if Xendit API fails
        } else if (data.error && !data.status) {
          // Real error, no status available
          console.error('Payment status error:', data.error);
          if (data.finePaid) {
            setStatus('success');
            return false;
          }
          // Don't set error immediately, might be temporary
          return true; // Continue polling
        }
        
        // Check status in priority order (use local status from database)
        if (data.finePaid) {
          setStatus('success');
          return false; // Stop polling
        } else if (data.status === 'pending_verification') {
          // Payment received but waiting for staff verification
          setStatus('pending_verification');
          return false; // Stop polling, waiting for staff
        } else if (data.status === 'paid' || (data.xenditStatus === 'PAID' && data.finePaid)) {
          setStatus('success');
          return false; // Stop polling
        } else if (data.status === 'pending' || data.xenditStatus === 'PENDING') {
          setStatus('pending');
          // Continue polling if still pending
          return true; // Signal to continue polling
        } else if (data.status) {
          // Use whatever status we have from database
          if (data.status === 'pending_verification') {
            setStatus('pending_verification');
          } else {
            setStatus('pending');
          }
          return true; // Continue polling
        } else {
          // No status available
          setStatus('error');
          return false; // Stop polling
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        // Don't set error immediately, might be temporary network issue
        return true; // Continue polling
      }
      
      return false; // Stop polling
    };

    // Initial check
    let intervalId = null;
    let pollCount = 0;
    const maxPolls = 20; // Maximum 20 polls (30 seconds total)
    
    checkStatus().then((shouldContinue) => {
      // Poll every 3 seconds if status is still pending (reduced frequency to avoid rate limits)
      if (shouldContinue) {
        intervalId = setInterval(async () => {
          pollCount++;
          
          // Stop if max polls reached
          if (pollCount >= maxPolls) {
            if (intervalId) clearInterval(intervalId);
            return;
          }
          
          const shouldContinuePolling = await checkStatus();
          if (!shouldContinuePolling) {
            if (intervalId) clearInterval(intervalId);
          }
        }, 3000); // Check every 3 seconds (reduced to avoid rate limits)

        // Stop polling after 1 minute
        setTimeout(() => {
          if (intervalId) clearInterval(intervalId);
        }, 60000);

        return () => {
          if (intervalId) clearInterval(intervalId);
        };
      }
    });

    // Cleanup on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [searchParams, orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        {status === 'checking' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Memverifikasi Pembayaran
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Mohon tunggu sebentar...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Pembayaran Berhasil!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Denda Anda telah berhasil dibayar. Terima kasih!
            </p>
            <Link
              href="/siswa/peminjaman"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Kembali ke Peminjaman
            </Link>
          </div>
        )}

        {status === 'pending_verification' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-orange-600 dark:text-orange-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Menunggu Verifikasi Petugas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Pembayaran Anda telah diterima. Petugas akan memverifikasi pembayaran dalam waktu singkat. 
              Status akan diperbarui setelah verifikasi selesai.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  const externalId = searchParams.get('external_id');
                  const id = externalId || orderId;
                  if (id) {
                    try {
                      const res = await fetch(`/api/payments/status/${encodeURIComponent(id)}`);
                      if (res.ok) {
                        const data = await res.json();
                        if (data.finePaid) {
                          setStatus('success');
                        } else {
                          router.refresh();
                        }
                      }
                    } catch (error) {
                      console.error('Refresh error:', error);
                    }
                  }
                  setIsRefreshing(false);
                }}
                disabled={isRefreshing}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memperbarui...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Perbarui Status</span>
                  </>
                )}
              </button>
              <Link
                href="/siswa/peminjaman"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Kembali ke Peminjaman
              </Link>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-yellow-600 dark:text-yellow-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Pembayaran Sedang Diproses
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Pembayaran Anda sedang diproses. Status akan diperbarui dalam beberapa saat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  const externalId = searchParams.get('external_id');
                  const id = externalId || orderId;
                  if (id) {
                    try {
                      const res = await fetch(`/api/payments/status/${encodeURIComponent(id)}`);
                      if (res.ok) {
                        const data = await res.json();
                        if (data.finePaid) {
                          setStatus('success');
                        } else if (data.status === 'pending_verification') {
                          setStatus('pending_verification');
                        } else if (data.status === 'paid') {
                          setStatus('success');
                        } else {
                          router.refresh();
                        }
                      }
                    } catch (error) {
                      console.error('Refresh error:', error);
                    }
                  }
                  setIsRefreshing(false);
                }}
                disabled={isRefreshing}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memperbarui...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Perbarui Status</span>
                  </>
                )}
              </button>
              <Link
                href="/siswa/peminjaman"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Kembali ke Peminjaman
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tidak dapat memverifikasi pembayaran. Silakan hubungi admin jika pembayaran sudah dilakukan.
            </p>
            <Link
              href="/siswa/peminjaman"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Kembali ke Peminjaman
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


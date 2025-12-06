'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token tidak ditemukan');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-email-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email berhasil diverifikasi. Admin akan meninjau permintaan Anda.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Token tidak valid atau sudah kadaluarsa');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Terjadi kesalahan saat memverifikasi token');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700"
      >
        {status === 'verifying' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Memverifikasi Email
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
              Email Terverifikasi!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Kembali ke Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifikasi Gagal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Kembali ke Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}








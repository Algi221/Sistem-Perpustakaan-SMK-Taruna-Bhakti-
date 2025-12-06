'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Pembayaran Gagal
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi atau hubungi admin jika masalah berlanjut.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/siswa/peminjaman"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Kembali ke Peminjaman
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


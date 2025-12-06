'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BorrowButton({ bookId, available }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBorrow = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role === 'staff' || session.user.role === 'admin') {
      setMessage('Petugas dan Admin tidak dapat meminjam buku');
      return;
    }

    if (available === 0) {
      setMessage('Buku tidak tersedia');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: parseInt(bookId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Gagal meminjam buku');
        return;
      }

      setMessage('Permintaan peminjaman berhasil dikirim!');
      router.refresh();
    } catch (error) {
      setMessage('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Link
        href="/login"
        className="w-full inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
      >
        <span>🔐</span>
        <span>Login untuk Meminjam</span>
      </Link>
    );
  }

  if (session.user.role === 'staff' || session.user.role === 'admin') {
    return null;
  }

  return (
    <div>
      <button
        onClick={handleBorrow}
        disabled={loading || available === 0}
        className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 disabled:transform-none shadow-lg ${
          available > 0
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
            : 'bg-gray-400 text-white cursor-not-allowed'
        } disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Memproses...</span>
          </>
        ) : available > 0 ? (
          <>
            <span>📚</span>
            <span>Pinjam Buku Sekarang</span>
          </>
        ) : (
          <>
            <span>❌</span>
            <span>Tidak Tersedia</span>
          </>
        )}
      </button>
      {message && (
        <div className={`mt-4 px-4 py-3 rounded-lg flex items-center gap-2 ${
          message.includes('berhasil') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.includes('berhasil') ? '✅' : '❌'}</span>
          <span className="font-semibold">{message}</span>
        </div>
      )}
    </div>
  );
}


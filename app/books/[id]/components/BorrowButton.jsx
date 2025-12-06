'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import BorrowModal from './BorrowModal';
import { Clock, CheckCircle, BookOpen, AlertCircle } from 'lucide-react';

export default function BorrowButton({ bookId, available, book, userBorrowing }) {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!session) {
    return (
      <Link
        href="/login"
        className="w-full inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <span>+</span>
        <span>Pinjam buku ini</span>
      </Link>
    );
  }

  if (session.user.role === 'staff' || session.user.role === 'admin') {
    return null;
  }

  // Jika user sudah meminjam buku ini
  if (userBorrowing) {
    const getStatusInfo = (status) => {
      switch (status) {
        case 'pending':
          return {
            icon: <Clock className="w-5 h-5" />,
            text: 'Menunggu Persetujuan',
            message: 'Permintaan peminjaman Anda sedang menunggu persetujuan staff',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            textColor: 'text-yellow-800 dark:text-yellow-300',
            link: '/siswa/peminjaman'
          };
        case 'approved':
          return {
            icon: <CheckCircle className="w-5 h-5" />,
            text: 'Disetujui - Siap Diambil',
            message: 'Buku sudah disetujui. Silakan ambil buku dan konfirmasi di halaman peminjaman',
            bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            textColor: 'text-blue-800 dark:text-blue-300',
            link: '/siswa/peminjaman'
          };
        case 'borrowed':
          const dueDate = userBorrowing.due_date ? new Date(userBorrowing.due_date) : null;
          const isOverdue = dueDate && dueDate < new Date();
          return {
            icon: <BookOpen className="w-5 h-5" />,
            text: isOverdue ? 'Terlambat Dikembalikan' : 'Sedang Dipinjam',
            message: isOverdue 
              ? `Buku harus dikembalikan sebelum ${dueDate.toLocaleDateString('id-ID')}. Silakan kembalikan segera.`
              : `Buku sedang Anda pinjam. Jatuh tempo: ${dueDate ? dueDate.toLocaleDateString('id-ID') : '-'}`,
            bg: isOverdue 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            textColor: isOverdue 
              ? 'text-red-800 dark:text-red-300'
              : 'text-green-800 dark:text-green-300',
            link: '/siswa/peminjaman'
          };
        default:
          return {
            icon: <AlertCircle className="w-5 h-5" />,
            text: 'Status Tidak Diketahui',
            message: 'Silakan cek status peminjaman di halaman peminjaman',
            bg: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
            textColor: 'text-gray-800 dark:text-gray-300',
            link: '/siswa/peminjaman'
          };
      }
    };

    const statusInfo = getStatusInfo(userBorrowing.status);

    return (
      <Link href={statusInfo.link}>
        <div className={`w-full px-6 py-4 rounded-lg border-2 ${statusInfo.bg} ${statusInfo.textColor} transition-all shadow-md`}>
          <div className="flex items-center gap-3 mb-2">
            {statusInfo.icon}
            <span className="font-semibold">{statusInfo.text}</span>
          </div>
          <p className="text-sm opacity-90">{statusInfo.message}</p>
          <p className="text-xs mt-2 opacity-75">Klik untuk melihat detail peminjaman</p>
        </div>
      </Link>
    );
  }

  // Jika user belum meminjam dan buku tersedia
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={available === 0}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${
          available > 0
            ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            : 'bg-gray-400 text-white cursor-not-allowed dark:bg-gray-600'
        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        {available > 0 ? (
          <>
            <span>+</span>
            <span>Pinjam buku ini</span>
          </>
        ) : (
          <>
            <span>❌</span>
            <span>Tidak Tersedia</span>
          </>
        )}
      </button>

      <BorrowModal
        bookId={bookId}
        available={available}
        book={book}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}


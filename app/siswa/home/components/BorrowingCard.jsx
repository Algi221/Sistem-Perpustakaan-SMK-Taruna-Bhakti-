'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle, BookOpen, Book, XCircle, FileText, AlertTriangle, Calendar, RotateCcw } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

export default function BorrowingCard({ borrowing }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-300',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
          icon: Clock,
          label: 'Menunggu Persetujuan'
        };
      case 'approved':
        return {
          bg: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800',
          text: 'text-teal-800 dark:text-teal-300',
          badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
          icon: CheckCircle,
          label: 'Disetujui'
        };
      case 'borrowed':
        return {
          bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
          text: 'text-emerald-800 dark:text-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
          icon: BookOpen,
          label: 'Dipinjam'
        };
      case 'returned':
        return {
          bg: 'bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800',
          text: 'text-slate-800 dark:text-slate-300',
          badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
          icon: Book,
          label: 'Dikembalikan'
        };
      case 'rejected':
        return {
          bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          text: 'text-red-800 dark:text-red-300',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
          icon: XCircle,
          label: 'Ditolak'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
          text: 'text-gray-800 dark:text-gray-300',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
          icon: FileText,
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(borrowing.status);
  const isOverdue = borrowing.due_date && new Date(borrowing.due_date) < new Date() && borrowing.status === 'borrowed';

  return (
    <Link href={`/books/${borrowing.book_id}`}>
      <div className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 ${statusConfig.bg} dark:border-gray-700`}>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={borrowing.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
            alt={borrowing.title}
            fill
            className="object-cover object-center w-full h-full group-hover:scale-110 transition-transform duration-300"
            unoptimized
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 ${statusConfig.badge}`}>
              <statusConfig.icon className="w-3.5 h-3.5" />
              <span>{statusConfig.label}</span>
            </span>
          </div>
          {isOverdue && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Terlambat
              </span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {borrowing.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">oleh</span>
            <span className="font-medium">{borrowing.author}</span>
          </p>
          
          <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            {borrowing.borrow_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Pinjam:</span>
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(borrowing.borrow_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
            {borrowing.due_date && borrowing.status === 'borrowed' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Sisa Waktu:</span>
                </span>
                <CountdownTimer dueDate={borrowing.due_date} />
              </div>
            )}
            {borrowing.due_date && borrowing.status !== 'borrowed' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Jatuh Tempo:</span>
                </span>
                <span className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {new Date(borrowing.due_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
            {borrowing.return_date && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  <span>Kembali:</span>
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(borrowing.return_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { useState } from 'react';
import { Calendar, Clock, User, BookOpen, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import StaffCalendar from '@/components/staff/StaffCalendar';
import BorrowingDetailModal from './BorrowingDetailModal';

export default function PeminjamanAktif({ initialBorrowings }) {
  const [borrowings] = useState(initialBorrowings);
  const [viewMode, setViewMode] = useState('cards'); // 'calendar', 'list', or 'cards'
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);

  const activeBorrowings = borrowings.filter(b => 
    b.status === 'approved' || b.status === 'borrowed'
  );

  const overdueBorrowings = activeBorrowings.filter(b => {
    if (!b.due_date) return false;
    const dueDate = new Date(b.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && b.status === 'borrowed';
  });

  const dueSoonBorrowings = activeBorrowings.filter(b => {
    if (!b.due_date || b.status !== 'borrowed') return false;
    const dueDate = new Date(b.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3; // Akan jatuh tempo dalam 3 hari
  });

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <span>Peminjaman Aktif</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola peminjaman buku yang sedang aktif</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Card Buku
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'calendar'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Kalender
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Daftar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Menunggu Konfirmasi</p>
              <p className="text-3xl font-bold">
                {activeBorrowings.filter(b => b.status === 'approved').length}
              </p>
            </div>
            <div className="text-4xl opacity-80">⏳</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Sedang Dipinjam</p>
              <p className="text-3xl font-bold">
                {activeBorrowings.filter(b => b.status === 'borrowed').length}
              </p>
            </div>
            <div className="text-4xl opacity-80">📚</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Akan Jatuh Tempo</p>
              <p className="text-3xl font-bold">{dueSoonBorrowings.length}</p>
            </div>
            <div className="text-4xl opacity-80">⏰</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">Terlambat</p>
              <p className="text-3xl font-bold">{overdueBorrowings.length}</p>
            </div>
            <div className="text-4xl opacity-80">⚠️</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBorrowings.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Tidak ada peminjaman aktif.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Semua buku telah dikembalikan!</p>
            </div>
          ) : (
            activeBorrowings.map((borrowing) => {
              const daysUntilDue = getDaysUntilDue(borrowing.due_date);
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
              
              return (
                <div
                  key={borrowing.id}
                  onClick={() => setSelectedBorrowing(borrowing)}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border cursor-pointer ${
                    isOverdue
                      ? 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800'
                      : daysUntilDue !== null && daysUntilDue <= 3
                      ? 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Book Image Section */}
                  <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center p-4">
                    {borrowing.image_url ? (
                      <Image
                        src={borrowing.image_url}
                        alt={borrowing.title}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl opacity-50">📚</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm ${
                        borrowing.status === 'approved'
                          ? 'bg-yellow-500/90 text-white'
                          : 'bg-green-500/90 text-white'
                      }`}>
                        {borrowing.status === 'approved' ? '⏳ Menunggu' : '📖 Dipinjam'}
                      </span>
                    </div>
                    
                    {/* Overdue Badge */}
                    {isOverdue && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold shadow-lg animate-pulse flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Terlambat</span>
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Book Info Section */}
                  <div className="p-6">
                    {/* Title & Author */}
                    <div className="mb-4">
                      <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {borrowing.title}
                    </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5">
                        <span>oleh</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{borrowing.author}</span>
                    </p>
                    </div>
                    
                    {/* User & Date Info */}
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Peminjam</p>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{borrowing.user_name}</p>
                        </div>
                      </div>
                      
                      {borrowing.due_date && (
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isOverdue
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : daysUntilDue !== null && daysUntilDue <= 3
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Clock className={`w-4 h-4 ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : daysUntilDue !== null && daysUntilDue <= 3
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Jatuh Tempo</p>
                            <p className={`font-semibold text-sm ${
                              isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : daysUntilDue !== null && daysUntilDue <= 3
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                              {new Date(borrowing.due_date).toLocaleDateString('id-ID', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {daysUntilDue !== null && (
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isOverdue
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : daysUntilDue <= 3
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-green-100 dark:bg-green-900/30'
                          }`}>
                            <Calendar className={`w-4 h-4 ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : daysUntilDue <= 3
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sisa Waktu</p>
                            <p className={`font-bold text-sm ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : daysUntilDue <= 3
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                          }`}>
                            {isOverdue
                              ? `Terlambat ${Math.abs(daysUntilDue)} hari`
                              : daysUntilDue === 0
                                ? 'Hari ini jatuh tempo!'
                              : `${daysUntilDue} hari lagi`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Click Hint */}
                    <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-center text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        👆 Klik untuk detail lengkap
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <StaffCalendar borrowings={borrowings} />
        </div>
      ) : (
        <div className="space-y-4">
          {activeBorrowings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Tidak ada peminjaman aktif.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Semua buku telah dikembalikan!</p>
            </div>
          ) : (
            activeBorrowings.map((borrowing) => {
              const daysUntilDue = getDaysUntilDue(borrowing.due_date);
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
              
              return (
                <div
                  key={borrowing.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
                    isOverdue
                      ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20'
                      : daysUntilDue !== null && daysUntilDue <= 3
                      ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {borrowing.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">oleh {borrowing.author}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          borrowing.status === 'approved'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {borrowing.status === 'approved' ? '⏳ Menunggu Konfirmasi' : '📖 Dipinjam'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Peminjam</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{borrowing.user_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Pinjam</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {borrowing.borrow_date 
                                ? new Date(borrowing.borrow_date).toLocaleDateString('id-ID')
                                : 'Belum diambil'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Jatuh Tempo</p>
                            <p className={`font-semibold ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : daysUntilDue !== null && daysUntilDue <= 3
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {borrowing.due_date 
                                ? new Date(borrowing.due_date).toLocaleDateString('id-ID')
                                : '-'}
                              {daysUntilDue !== null && (
                                <span className="ml-2 text-xs">
                                  ({isOverdue 
                                    ? `Terlambat ${Math.abs(daysUntilDue)} hari`
                                    : daysUntilDue === 0
                                    ? 'Hari ini'
                                    : `${daysUntilDue} hari lagi`})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {borrowing.duration_days || 14} hari
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBorrowing && (
        <BorrowingDetailModal
          borrowing={selectedBorrowing}
          isOpen={!!selectedBorrowing}
          onClose={() => setSelectedBorrowing(null)}
        />
      )}
    </div>
  );
}


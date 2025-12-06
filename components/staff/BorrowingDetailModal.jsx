'use client';

import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import BorrowingCalendar from '@/app/books/[id]/components/BorrowingCalendar';

export default function BorrowingDetailModal({ borrowing, isOpen, onClose }) {
  if (!isOpen || !borrowing) return null;

  const daysUntilDue = borrowing.due_date ? (() => {
    const due = new Date(borrowing.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  })() : null;

  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detail Peminjaman
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Book Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                <div className="relative aspect-[3/4] w-full mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {borrowing.image_url ? (
                    <Image
                      src={borrowing.image_url}
                      alt={borrowing.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">📚</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {borrowing.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  oleh {borrowing.author}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                    {borrowing.genre}
                  </span>
                </div>
                
                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    borrowing.status === 'approved'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {borrowing.status === 'approved' ? '✅ Disetujui' : '📖 Dipinjam'}
                  </span>
                </div>

                {/* Dates Info */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                      <span className={`font-semibold ${
                        isOverdue
                          ? 'text-red-600 dark:text-red-400'
                          : daysUntilDue !== null && daysUntilDue <= 3
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {new Date(borrowing.due_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {daysUntilDue !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>Sisa Waktu:</span>
                      </span>
                      <span className={`font-semibold ${
                        isOverdue
                          ? 'text-red-600 dark:text-red-400'
                          : daysUntilDue <= 3
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {isOverdue
                          ? `Terlambat ${Math.abs(daysUntilDue)} hari`
                          : daysUntilDue === 0
                          ? 'Hari ini'
                          : `${daysUntilDue} hari lagi`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - User Info & Calendar */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Data Peminjam
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{borrowing.user_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white break-all">{borrowing.user_email}</p>
                    </div>
                  </div>
                  
                  {borrowing.user_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No. Telepon</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{borrowing.user_phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {borrowing.user_address && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Alamat</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{borrowing.user_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Kalender Peminjaman
                </h3>
                <BorrowingCalendar bookId={borrowing.book_id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


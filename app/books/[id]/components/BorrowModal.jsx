'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function BorrowModal({ bookId, available, book, isOpen, onClose }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [borrowings, setBorrowings] = useState([]);

  useEffect(() => {
    if (isOpen && bookId) {
      fetchBorrowings();
      // Set default selected date to today
      setSelectedDate(new Date());
    }
  }, [isOpen, bookId]);

  const fetchBorrowings = async () => {
    try {
      const response = await fetch(`/api/borrowings?bookId=${bookId}`);
      if (response.ok) {
        const data = await response.json();
        setBorrowings(data);
      }
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getBorrowingForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return borrowings.find(borrowing => {
      if (borrowing.status !== 'borrowed' && borrowing.status !== 'approved') {
        return false;
      }
      const borrowDate = new Date(borrowing.borrow_date);
      const dueDate = new Date(borrowing.due_date);
      const borrowStr = borrowDate.toISOString().split('T')[0];
      const dueStr = dueDate.toISOString().split('T')[0];
      
      return dateStr >= borrowStr && dateStr <= dueStr;
    });
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (checkDate < today) return true;
    
    // Disable dates that are already borrowed
    const borrowing = getBorrowingForDate(date);
    return !!borrowing;
  };

  const isDateSelectable = (date) => {
    if (!date || isDateDisabled(date)) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const daysDiff = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));
    
    // Must be between 14 and 30 days
    return daysDiff >= 14 && daysDiff <= 30;
  };

  const handleDateSelect = (date) => {
    if (!isDateSelectable(date)) return;
    setSelectedDate(date);
  };

  const calculateDuration = () => {
    if (!selectedDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((selected - today) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const durationDays = calculateDuration();
  const isValidDuration = durationDays >= 14 && durationDays <= 30;

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const days = getDaysInMonth(currentMonth);

  const handleBorrow = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role === 'staff' || session.user.role === 'admin') {
      showToast('Petugas dan Admin tidak dapat meminjam buku', 'error');
      return;
    }

    if (available === 0) {
      showToast('Buku tidak tersedia', 'error');
      return;
    }

    if (!isValidDuration || !selectedDate) {
      showToast('Pilih tanggal jatuh tempo antara 14-30 hari dari hari ini', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: parseInt(bookId),
          durationDays: durationDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Gagal meminjam buku', 'error');
        return;
      }

      showToast('Permintaan peminjaman berhasil dikirim!', 'success');
      onClose();
      router.refresh();
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pinjam Buku</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{book?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">Pilih tanggal jatuh tempo peminjaman</p>
                <p>Durasi peminjaman minimal <span className="font-bold">14 hari (2 minggu)</span> dan maksimal <span className="font-bold">30 hari (1 bulan)</span> dari hari ini.</p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="aspect-square"></div>;
                }

                const isDisabled = isDateDisabled(date);
                const isSelectable = isDateSelectable(date);
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                const borrowing = getBorrowingForDate(date);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(date)}
                    disabled={!isSelectable}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : isSelectable
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-2 hover:border-blue-400 cursor-pointer'
                        : isDisabled
                        ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    } ${
                      isToday && !isSelected ? 'ring-2 ring-blue-400' : ''
                    } ${
                      borrowing ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''
                    }`}
                    title={
                      borrowing 
                        ? `Sudah dipinjam sampai ${new Date(borrowing.due_date).toLocaleDateString('id-ID')}`
                        : isSelectable
                        ? `Pilih tanggal ini (${durationDays} hari)`
                        : isDisabled
                        ? 'Tanggal tidak tersedia'
                        : 'Durasi harus 14-30 hari'
                    }
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Dipilih</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded ring-2 ring-blue-400"></div>
                <span className="text-gray-600 dark:text-gray-400">Hari Ini</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Sudah Dipinjam</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 dark:bg-gray-800/50 rounded opacity-50"></div>
                <span className="text-gray-600 dark:text-gray-400">Tidak Tersedia</span>
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && isValidDuration && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800 dark:text-green-300">
                  <p className="font-semibold mb-1">Tanggal jatuh tempo dipilih:</p>
                  <p className="font-bold text-base">
                    {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="mt-1">Durasi: <span className="font-bold">{durationDays} hari</span></p>
                </div>
              </div>
            </div>
          )}

          {selectedDate && !isValidDuration && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-semibold">Durasi tidak valid</p>
                  <p>Pilih tanggal dengan durasi antara 14-30 hari dari hari ini.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleBorrow}
            disabled={loading || !isValidDuration || available === 0}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <CheckCircle className="w-5 h-5" />
                <span>Konfirmasi Pinjam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


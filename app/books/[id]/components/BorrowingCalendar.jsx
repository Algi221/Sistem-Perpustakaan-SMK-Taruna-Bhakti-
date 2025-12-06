'use client';

import { useState, useEffect } from 'react';

export default function BorrowingCalendar({ bookId }) {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchBorrowings();
  }, [bookId]);

  const fetchBorrowings = async () => {
    try {
      const response = await fetch(`/api/borrowings?bookId=${bookId}`);
      if (response.ok) {
        const data = await response.json();
        setBorrowings(data);
      }
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    } finally {
      setLoading(false);
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

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDue = (date) => {
    if (!date) return false;
    const borrowing = getBorrowingForDate(date);
    if (!borrowing) return false;
    const dueDate = new Date(borrowing.due_date);
    return date > dueDate && borrowing.status === 'borrowed';
  };

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

  // Recalculate days when currentMonth changes
  const days = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📅</span>
            <span>Kalender Peminjaman</span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-black dark:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-black dark:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-[10px] font-semibold text-gray-600 dark:text-gray-400 py-1">
{day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, idx) => {
          const borrowing = getBorrowingForDate(date);
          const today = isToday(date);
          const pastDue = isPastDue(date);

          if (!date) {
            return <div key={idx} className="aspect-square"></div>;
          }

          return (
            <div
              key={idx}
              className={`aspect-square flex flex-col items-center justify-center text-[10px] rounded border transition-all ${
                today
                  ? 'bg-blue-500 text-white border-blue-600 font-bold'
                  : borrowing
                  ? pastDue
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title={borrowing ? `Dipinjam sampai ${new Date(borrowing.due_date).toLocaleDateString('id-ID')}` : ''}
            >
              <span className={today ? 'font-bold' : ''}>{date.getDate()}</span>
              {borrowing && (
                <span className="text-[6px] mt-0.5 opacity-75">
                  {pastDue ? '⚠️' : '📖'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Hari Ini</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Dipinjam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Terlambat</span>
          </div>
        </div>
      </div>
    </div>
  );
}


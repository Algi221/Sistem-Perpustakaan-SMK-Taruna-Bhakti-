'use client';

import { useState, useEffect } from 'react';

export default function StaffCalendar({ borrowings }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getBorrowingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return borrowings.filter(borrowing => {
      if (borrowing.status === 'returned') {
        // Untuk returned, cek return_date
        if (borrowing.return_date) {
          return borrowing.return_date.split('T')[0] === dateStr;
        }
      } else if (borrowing.status === 'borrowed' && borrowing.borrow_date) {
        // Untuk borrowed, cek apakah tanggal dalam rentang borrow_date sampai due_date
        const borrowDate = new Date(borrowing.borrow_date);
        const dueDate = new Date(borrowing.due_date);
        const checkDate = new Date(date);
        return checkDate >= borrowDate && checkDate <= dueDate;
      }
      return false;
    });
  };

  const isOverdue = (borrowing) => {
    if (borrowing.status !== 'borrowed') return false;
    const dueDate = new Date(borrowing.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getDateColor = (date) => {
    const dateBorrowings = getBorrowingsForDate(date);
    if (dateBorrowings.length === 0) return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';

    const hasOverdue = dateBorrowings.some(b => isOverdue(b));
    const hasReturned = dateBorrowings.some(b => b.status === 'returned');
    const hasBorrowed = dateBorrowings.some(b => b.status === 'borrowed' && !isOverdue(b));

    if (hasOverdue) return 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600';
    if (hasReturned) return 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600';
    if (hasBorrowed) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600';
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
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

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateBorrowings = selectedDate ? getBorrowingsForDate(selectedDate) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📅</span>
            <span>Kalender Peminjaman</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={idx} className="aspect-square"></div>;
          }

          const dateBorrowings = getBorrowingsForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const colorClass = getDateColor(date);

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${colorClass} ${
                isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2' : ''
              } ${selectedDate && date.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-blue-600 dark:ring-blue-400' : ''} text-gray-900 dark:text-white`}
            >
              <span className={isToday ? 'font-bold' : ''}>{date.getDate()}</span>
              {dateBorrowings.length > 0 && (
                <span className="text-xs mt-1 font-semibold">
                  {dateBorrowings.length}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Dipinjam (On Process)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Sudah Dikembalikan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Terlambat</span>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDateBorrowings.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
            Peminjaman pada {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedDateBorrowings.map((borrowing) => (
              <div
                key={borrowing.id}
                className={`p-3 rounded-lg border-2 ${
                  isOverdue(borrowing)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    : borrowing.status === 'returned'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{borrowing.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{borrowing.user_name}</p>
                  </div>
                  <div className="text-right">
                    {isOverdue(borrowing) && (
                      <span className="text-xs font-bold text-red-600">Terlambat</span>
                    )}
                    {borrowing.status === 'returned' && (
                      <span className="text-xs font-bold text-green-600">Dikembalikan</span>
                    )}
                    {borrowing.status === 'borrowed' && !isOverdue(borrowing) && (
                      <span className="text-xs font-bold text-yellow-600">Dipinjam</span>
                    )}
                  </div>
                </div>
                {borrowing.due_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Jatuh tempo: {new Date(borrowing.due_date).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


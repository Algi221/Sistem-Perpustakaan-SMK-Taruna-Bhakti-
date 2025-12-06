'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CalendarView({ borrowings }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get borrowings for the current month
  const getBorrowingsForDate = (date) => {
    return borrowings.filter(borrowing => {
      const borrowDate = new Date(borrowing.borrow_date);
      const dueDate = borrowing.due_date ? new Date(borrowing.due_date) : null;
      
      const dateStr = date.toISOString().split('T')[0];
      const borrowStr = borrowDate.toISOString().split('T')[0];
      const dueStr = dueDate ? dueDate.toISOString().split('T')[0] : null;
      
      return borrowStr === dateStr || (dueStr && dueStr === dateStr);
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDate(null);
  };

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const renderCalendar = () => {
    const days = [];
    const dayNames = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Day names header
    days.push(
      <div key="header" className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-bold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
    );

    // Empty cells for days before month starts
    const emptyCells = [];
    for (let i = 0; i < firstDay; i++) {
      emptyCells.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    const dayCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateBorrowings = getBorrowingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      dayCells.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all hover:scale-105 ${
            isToday
              ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 font-bold'
              : isSelected
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
          }`}
        >
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{day}</div>
          {dateBorrowings.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dateBorrowings.slice(0, 2).map((borrowing, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    new Date(borrowing.due_date) < new Date() && borrowing.status === 'borrowed'
                      ? 'bg-red-500'
                      : borrowing.status === 'borrowed'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  title={borrowing.title}
                />
              ))}
              {dateBorrowings.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">+{dateBorrowings.length - 2}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    days.push(
      <div key="days" className="grid grid-cols-7 gap-2">
        {emptyCells}
        {dayCells}
      </div>
    );

    return days;
  };

  const selectedDateBorrowings = selectedDate ? getBorrowingsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span>📅</span>
          <span>Kalender Peminjaman</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            ←
          </button>
          <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
            {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            →
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {renderCalendar()}
      </div>

      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Peminjaman pada {selectedDate.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          {selectedDateBorrowings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Tidak ada peminjaman pada tanggal ini</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDateBorrowings.map((borrowing) => (
                <Link
                  key={borrowing.id}
                  href={`/books/${borrowing.book_id}`}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all hover:border-gray-300 dark:hover:border-gray-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={borrowing.image_url || 'https://via.placeholder.com/200?text=No+Image'}
                        alt={borrowing.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">
                        {borrowing.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{borrowing.author}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full font-semibold ${
                          borrowing.status === 'borrowed'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : borrowing.status === 'returned'
                            ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                        }`}>
                          {borrowing.status === 'borrowed' ? 'Dipinjam' :
                           borrowing.status === 'returned' ? 'Dikembalikan' :
                           borrowing.status === 'pending' ? 'Menunggu' : borrowing.status}
                        </span>
                        {borrowing.due_date && (
                          <span className="text-gray-600 dark:text-gray-400">
                            Jatuh tempo: {new Date(borrowing.due_date).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Keterangan:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Dipinjam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Menunggu/Disetujui</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Terlambat</span>
          </div>
        </div>
      </div>
    </div>
  );
}


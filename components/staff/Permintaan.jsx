'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, X, ClipboardList } from 'lucide-react';
import BorrowingRequestCard from '@/components/borrowings/BorrowingRequestCard';
import CancellationReasons from './CancellationReasons';

export default function Permintaan({ initialBorrowings }) {
  const [borrowings, setBorrowings] = useState(initialBorrowings);
  const [showNotifications, setShowNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const pending = borrowings.filter(b => b.status === 'pending');
    const returnRequests = borrowings.filter(b => b.status === 'return_requested');
    const allNotifications = [
      ...pending.map(b => ({
        id: `pending-${b.id}`,
      message: `${b.user_name} meminta pinjam "${b.title}"`,
      borrowing: b,
      time: new Date(b.created_at).toLocaleString('id-ID')
      })),
      ...returnRequests.map(b => ({
        id: `return-${b.id}`,
        message: `${b.user_name} meminta kembalikan "${b.title}"`,
        borrowing: b,
        time: new Date(b.updated_at).toLocaleString('id-ID')
      }))
    ];
    setNotifications(allNotifications);
  }, [borrowings]);

  const pendingBorrowings = borrowings.filter(b => b.status === 'pending');
  const returnRequestedBorrowings = borrowings.filter(b => b.status === 'return_requested');
  const rejectedBorrowings = borrowings.filter(b => b.status === 'rejected');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'return_requested', or 'rejected'

  const handleBorrowingUpdate = (updatedBorrowing) => {
    setBorrowings(borrowings.map(b => 
      b.id === updatedBorrowing.id ? updatedBorrowing : b
    ));
    // Remove notification when approved
    if (updatedBorrowing.status === 'approved') {
      setNotifications(notifications.filter(n => n.id !== updatedBorrowing.id));
    }
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="p-6 md:p-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <ClipboardList className="w-8 h-8" />
            <span>Permintaan Peminjaman</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola permintaan peminjaman dari pengguna</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg flex items-center gap-2"
          >
            <Bell className="w-5 h-5" />
            <span>Notifikasi</span>
            {pendingBorrowings.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {pendingBorrowings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Menunggu Persetujuan</p>
              <p className="text-3xl font-bold">{pendingBorrowings.length}</p>
            </div>
            <div className="text-4xl opacity-80">⏳</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Permintaan</p>
              <p className="text-3xl font-bold">{borrowings.length}</p>
            </div>
            <div className="text-4xl opacity-80">📋</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Disetujui Hari Ini</p>
              <p className="text-3xl font-bold">
                {borrowings.filter(b => {
                  const today = new Date().toDateString();
                  const borrowDate = new Date(b.created_at).toDateString();
                  return b.status === 'approved' && borrowDate === today;
                }).length}
              </p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>
      </div>

      {/* Cancellation Reasons Component */}
      <CancellationReasons />

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'pending'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Menunggu Persetujuan ({pendingBorrowings.length})
        </button>
        <button
          onClick={() => setActiveTab('return_requested')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'return_requested'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Permintaan Pengembalian ({returnRequestedBorrowings.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'rejected'
              ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Ditolak ({rejectedBorrowings.length})
        </button>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'pending' && (
            <>
              {pendingBorrowings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Tidak ada permintaan peminjaman.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Semua permintaan telah diproses!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBorrowings.map((borrowing) => (
                    <BorrowingRequestCard
                      key={borrowing.id}
                      borrowing={borrowing}
                      onUpdate={handleBorrowingUpdate}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'return_requested' && (
            <>
              {returnRequestedBorrowings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Tidak ada permintaan pengembalian.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Semua permintaan telah diproses!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returnRequestedBorrowings.map((borrowing) => (
                    <BorrowingRequestCard
                      key={borrowing.id}
                      borrowing={borrowing}
                      onUpdate={handleBorrowingUpdate}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'rejected' && (
            <>
              {rejectedBorrowings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Tidak ada peminjaman yang ditolak.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedBorrowings.map((borrowing) => (
                    <BorrowingRequestCard
                      key={borrowing.id}
                      borrowing={borrowing}
                      onUpdate={handleBorrowingUpdate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 h-fit sticky top-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Notifikasi
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border-l-4 border-indigo-500 dark:border-indigo-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.time}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { Shield, UserCog, Users, GraduationCap, User, BookOpen, Clock, CheckCircle, X } from 'lucide-react';
import AdminCharts from '@/components/admin/AdminCharts';

export default function AdminDashboardClient({ staff, users, recentBorrowings, recentActivities }) {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <span>Dashboard Admin</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Pemantauan aktivitas user dan petugas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1 font-medium">Total Petugas</p>
              <p className="text-3xl font-bold">{staff.length}</p>
            </div>
            <UserCog className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm mb-1 font-medium">Total User</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm mb-1 font-medium">User Siswa</p>
              <p className="text-3xl font-bold">{users.filter(u => u.role === 'siswa').length}</p>
            </div>
            <GraduationCap className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm mb-1 font-medium">User Umum</p>
              <p className="text-3xl font-bold">{users.filter(u => u.role === 'umum').length}</p>
            </div>
            <User className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          <span>Statistik & Grafik</span>
        </h2>
        <AdminCharts staff={staff} users={users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Borrowings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>Aktivitas Peminjaman Terkini</span>
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {recentBorrowings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Tidak ada aktivitas peminjaman</p>
            ) : (
              recentBorrowings.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {borrowing.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {borrowing.user_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {borrowing.status === 'pending' && '⏳ Meminta pinjam'}
                        {borrowing.status === 'approved' && '✅ Disetujui'}
                        {borrowing.status === 'borrowed' && '📖 Dipinjam'}
                        {borrowing.status === 'returned' && '📚 Dikembalikan'}
                        {borrowing.status === 'rejected' && '❌ Ditolak'}
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        "{borrowing.title}"
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(borrowing.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            <span>Aktivitas Petugas Terkini</span>
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Tidak ada aktivitas petugas</p>
            ) : (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      {activity.type === 'approve' && <CheckCircle className="w-5 h-5" />}
                      {activity.type === 'reject' && <X className="w-5 h-5" />}
                      {activity.type === 'create' && <UserCog className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


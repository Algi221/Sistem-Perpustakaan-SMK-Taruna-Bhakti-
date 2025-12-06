'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Users, GraduationCap, User, Trash2, Key, 
  Mail, Phone, MapPin, Calendar, Filter
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function UserManagement({ users, onUserDelete, onPasswordReset }) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [resettingPassword, setResettingPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Filter users berdasarkan tab dan search
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter berdasarkan tab
    if (activeTab === 'siswa') {
      filtered = filtered.filter(u => u.role === 'siswa');
    } else if (activeTab === 'umum') {
      filtered = filtered.filter(u => u.role === 'umum');
    }

    // Filter berdasarkan search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.phone && u.phone.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [users, activeTab, searchQuery]);

  // Hitung statistik
  const stats = useMemo(() => {
    const siswa = users.filter(u => u.role === 'siswa').length;
    const umum = users.filter(u => u.role === 'umum').length;
    return { total: users.length, siswa, umum };
  }, [users]);

  const handleDelete = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('User berhasil dihapus', 'success');
        onUserDelete(userId);
      } else {
        showToast('Gagal menghapus user', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
    }
  };

  const handlePasswordReset = async (userId) => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        showToast('Password berhasil direset', 'success');
        setResettingPassword(null);
        setNewPassword('');
        onPasswordReset();
      } else {
        showToast('Gagal mereset password', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1 font-medium">Total User</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm mb-1 font-medium">Siswa</p>
              <p className="text-3xl font-bold">{stats.siswa}</p>
            </div>
            <GraduationCap className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm mb-1 font-medium">Umum</p>
              <p className="text-3xl font-bold">{stats.umum}</p>
            </div>
            <User className="w-10 h-10 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari user berdasarkan nama, email, atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('siswa')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'siswa'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 inline mr-1" />
              Siswa ({stats.siswa})
            </button>
            <button
              onClick={() => setActiveTab('umum')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === 'umum'
                  ? 'bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4 inline mr-1" />
              Umum ({stats.umum})
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {searchQuery ? 'Tidak ada user yang sesuai dengan pencarian' : 'Belum ada user terdaftar'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 dark:text-blue-400 hover:underline mt-2"
            >
              Hapus filter pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
                user.role === 'siswa'
                  ? 'border-indigo-200 dark:border-indigo-800'
                  : 'border-teal-200 dark:border-teal-800'
              }`}
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                    user.role === 'siswa'
                      ? 'bg-gradient-to-br from-indigo-400 to-indigo-600'
                      : 'bg-gradient-to-br from-teal-400 to-teal-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'siswa'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                        : 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
                    }`}>
                      {user.role === 'siswa' ? (
                        <>
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Siswa
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          Umum
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{user.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {resettingPassword === user.id ? (
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password baru (min 6 karakter)"
                      className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      minLength={6}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePasswordReset(user.id)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        Simpan
                      </button>
                      <button
                        onClick={() => {
                          setResettingPassword(null);
                          setNewPassword('');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResettingPassword(user.id)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

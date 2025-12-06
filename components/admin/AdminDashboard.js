'use client';

import { useState } from 'react';
import { Shield, UserCog, Users, GraduationCap, User, Plus } from 'lucide-react';
import StaffForm from '@/components/staff/StaffForm';
import UserManagement from '@/components/admin/UserManagement';
import AdminCharts from '@/components/admin/AdminCharts';
import AdminSettings from '@/components/admin/AdminSettings';

export default function AdminDashboard({ staff: initialStaff, users: initialUsers }) {
  const [activePage, setActivePage] = useState('users');
  const [staff, setStaff] = useState(initialStaff);
  const [users, setUsers] = useState(initialUsers);
  const [showStaffForm, setShowStaffForm] = useState(false);

  const handleStaffCreate = (newStaff) => {
    setStaff([newStaff, ...staff]);
    setShowStaffForm(false);
  };

  const handleUserDelete = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handlePasswordReset = (userId) => {
    // This will be handled by the UserManagement component
  };

  return (
    <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3 transition-colors duration-300">
                <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                <span>Dashboard Admin</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {activePage === 'users' && 'Kelola data pengguna sistem'}
                {activePage === 'create-staff' && 'Tambah petugas baru'}
                {activePage === 'charts' && 'Statistik dan grafik sistem'}
                {activePage === 'settings' && 'Pengaturan sistem'}
              </p>
            </div>
            {activePage === 'create-staff' && (
              <button
                onClick={() => setShowStaffForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Petugas</span>
              </button>
            )}
          </div>

          {/* Stats Cards - Show on all pages except settings */}
          {activePage !== 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          )}

          {/* Staff Form Modal */}
          {showStaffForm && (
            <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-100 dark:border-gray-700 transition-colors duration-300">
                <StaffForm
                  onSave={handleStaffCreate}
                  onCancel={() => setShowStaffForm(false)}
                />
              </div>
            </div>
          )}

          {/* Content based on active page */}
          {activePage === 'users' && (
            <UserManagement
              users={users}
              onUserDelete={handleUserDelete}
              onPasswordReset={handlePasswordReset}
            />
          )}

          {activePage === 'create-staff' && (
            <div>
              {staff.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-blue-100 dark:border-gray-700 transition-colors duration-300">
                  <UserCog className="w-16 h-16 mb-4 text-blue-600 dark:text-blue-400 mx-auto" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Belum ada petugas terdaftar.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Klik tombol "Tambah Petugas" untuk menambahkan petugas pertama!</p>
                  <button
                    onClick={() => setShowStaffForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    Tambah Petugas Pertama
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Nama
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Telepon
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Tanggal Dibuat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {staff.map((s) => (
                          <tr key={s.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                  {s.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {s.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {s.phone || <span className="text-gray-400 dark:text-gray-500">-</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {new Date(s.created_at).toLocaleDateString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePage === 'charts' && (
            <AdminCharts staff={staff} users={users} />
          )}

          {activePage === 'settings' && (
            <AdminSettings />
          )}
    </div>
  );
}


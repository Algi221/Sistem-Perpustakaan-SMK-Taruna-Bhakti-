'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Key, Bell, Shield, Moon, Sun, Globe, Save, LogOut } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { signOut } from 'next-auth/react';

export default function Setting() {
  const { data: session } = useSession();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    borrowReminders: true,
    overdueAlerts: true,
    newRequests: true
  });

  const [generalSettings, setGeneralSettings] = useState({
    language: 'id',
    timezone: 'WIB',
    dateFormat: 'dd/mm/yyyy',
    fontSize: 'medium'
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal mengubah password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simpan ke localStorage atau API
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      setMessage({ type: 'success', text: 'Pengaturan notifikasi berhasil disimpan' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    // Clear sessionStorage flag before logout
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('perpustakaan_session_active');
      sessionStorage.removeItem('perpustakaan_last_activity');
    }
    // Sign out and redirect to home page
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'security', label: 'Keamanan', icon: Key },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'appearance', label: 'Tampilan', icon: Globe },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          <span>Pengaturan</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola pengaturan akun Anda</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600 dark:border-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pengaturan Umum</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bahasa
                    </label>
                    <select 
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Zona Waktu
                    </label>
                    <select 
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="WIB">WIB (UTC+7)</option>
                      <option value="WITA">WITA (UTC+8)</option>
                      <option value="WIT">WIT (UTC+9)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Format Tanggal
                    </label>
                    <select 
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Keamanan</h3>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimal 6 karakter</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    <Key className="w-5 h-5" />
                    {loading ? 'Mengubah...' : 'Ubah Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notifikasi</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Notifikasi Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Terima notifikasi melalui email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Pengingat Peminjaman</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi sebelum jatuh tempo</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.borrowReminders}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, borrowReminders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Peringatan Terlambat</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi untuk peminjaman terlambat</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.overdueAlerts}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, overdueAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Permintaan Baru</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi untuk permintaan peminjaman baru</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.newRequests}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, newRequests: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <button
                    onClick={handleNotificationSave}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tampilan</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        Mode Gelap
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Aktifkan mode gelap untuk kenyamanan mata</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Ukuran Font
                    </label>
                    <select 
                      value={generalSettings.fontSize}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, fontSize: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="small">Kecil</option>
                      <option value="medium">Sedang</option>
                      <option value="large">Besar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tema Warna
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {['blue', 'green', 'purple', 'orange'].map((color) => (
                        <button
                          key={color}
                          className={`h-12 rounded-lg border-2 ${
                            color === 'blue'
                              ? 'bg-blue-500 border-blue-600'
                              : color === 'green'
                              ? 'bg-green-500 border-green-600'
                              : color === 'purple'
                              ? 'bg-purple-500 border-purple-600'
                              : 'bg-orange-500 border-orange-600'
                          } hover:scale-110 transition-transform`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Section - Always Visible */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 transition-all hover:shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Keluar dari Akun</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session && `Masuk sebagai: ${session.user?.name || session.user?.email}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Logout</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Apakah Anda yakin ingin keluar dari akun petugas?</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Ya, Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


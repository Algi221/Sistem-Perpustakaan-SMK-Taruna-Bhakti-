'use client';

import { useState } from 'react';
import { Settings, Bell, Shield, Database, Key, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function AdminSettings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Settings className="w-6 h-6" />
          </div>
          <span>Settings</span>
        </h2>
        <p className="text-blue-100">Kelola pengaturan sistem perpustakaan</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex gap-2 border border-gray-100 dark:border-gray-700 transition-colors duration-300 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <span>General Settings</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔧</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Maintenance Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nonaktifkan akses sementara untuk maintenance</p>
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={() => handleToggle('maintenanceMode')}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500 shadow-lg"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xl">💾</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Auto Backup</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Backup otomatis setiap hari</p>
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={() => handleToggle('autoBackup')}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500 shadow-lg"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span>Notification Settings</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-yellow-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">System Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Terima notifikasi sistem</p>
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={() => handleToggle('notifications')}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500 shadow-lg"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📧</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Terima notifikasi via email</p>
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={() => handleToggle('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 shadow-lg"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span>Security Settings</span>
              </h3>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <Key className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-lg">Change Admin Password</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Perbarui password admin untuk keamanan</p>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    Change Password
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Session Management</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kelola sesi aktif pengguna</p>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    View Active Sessions
                  </button>
                </div>

                {/* Logout Section */}
                <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Logout</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session && `Logged in as: ${session.user?.name || session.user?.email}`}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <span>Database Management</span>
              </h3>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                      <span className="text-xl">💾</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-lg mb-1">Backup Database</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Buat backup database sekarang</p>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    Create Backup
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-lg">
                  <p className="font-semibold text-gray-800 dark:text-white mb-4 text-lg">Database Statistics</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl text-white shadow-lg">
                      <p className="text-xs text-blue-100 mb-2 font-medium">Total Tables</p>
                      <p className="text-3xl font-bold">12</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl text-white shadow-lg">
                      <p className="text-xs text-purple-100 mb-2 font-medium">Database Size</p>
                      <p className="text-3xl font-bold">2.5 MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
              <p className="text-gray-600 dark:text-gray-400 mb-6">Apakah Anda yakin ingin keluar dari akun admin?</p>
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


'use client';

import Image from 'next/image';
import { Users, UserPlus, Settings, Shield, User, LogOut, Key } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    // Clear sessionStorage flag before logout
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('perpustakaan_session_active');
    }
    // Sign out and redirect to home page
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield, color: 'blue', href: '/admin/dashboard' },
    { id: 'users', label: 'Data User', icon: Users, color: 'indigo', href: '/admin/dashboard/users' },
    { id: 'create-staff', label: 'Create Petugas', icon: UserPlus, color: 'cyan', href: '/admin/dashboard/create-staff' },
    { id: 'reset-password', label: 'Reset Password', icon: Key, color: 'orange', href: '/admin/dashboard/reset-password' },
    { id: 'profil', label: 'Profil', icon: User, color: 'purple', href: '/admin/dashboard/profil' },
    { id: 'settings', label: 'Setting', icon: Settings, color: 'gray', href: '/admin/dashboard/settings' },
  ];

  const getActivePage = () => {
    if (pathname?.includes('/profil')) return 'profil';
    if (pathname?.includes('/users')) return 'users';
    if (pathname?.includes('/create-staff')) return 'create-staff';
    if (pathname?.includes('/reset-password')) return 'reset-password';
    if (pathname?.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activePage = getActivePage();

  return (
    <aside className="w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 sticky top-0 h-screen overflow-y-auto transition-colors duration-300">
      <div className="p-6">
        {/* Logo & Branding */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/img/logo.png"
                alt="SMK Taruna Bhakti Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">SMK Taruna Bhakti</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? item.color === 'blue'
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600 dark:border-blue-400 shadow-sm'
                      : item.color === 'indigo'
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 text-indigo-700 dark:text-indigo-300 font-semibold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-sm'
                      : item.color === 'cyan'
                      ? 'bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 text-cyan-700 dark:text-cyan-300 font-semibold border-l-4 border-cyan-600 dark:border-cyan-400 shadow-sm'
                      : item.color === 'orange'
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-300 font-semibold border-l-4 border-orange-600 dark:border-orange-400 shadow-sm'
                      : item.color === 'purple'
                      ? 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-300 font-semibold border-l-4 border-purple-600 dark:border-purple-400 shadow-sm'
                      : item.color === 'gray'
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 text-gray-700 dark:text-gray-300 font-semibold border-l-4 border-gray-600 dark:border-gray-400 shadow-sm'
                      : 'bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-700 dark:text-teal-300 font-semibold border-l-4 border-teal-600 dark:border-teal-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 ${
                    isActive 
                      ? item.color === 'blue'
                        ? 'text-blue-600 dark:text-blue-400'
                        : item.color === 'indigo'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : item.color === 'cyan'
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : item.color === 'orange'
                        ? 'text-orange-600 dark:text-orange-400'
                        : item.color === 'purple'
                        ? 'text-purple-600 dark:text-purple-400'
                        : item.color === 'gray'
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`} 
                />
                <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          {showLogoutConfirm ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 text-center">Yakin ingin keluar?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Ya, Keluar
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 group"
            >
              <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              <span className="flex-1 text-sm font-medium text-left">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}


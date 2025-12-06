'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, BookOpen, Book, Star, ClipboardList, Laptop, Sparkles, Calendar, MapPin, User, Library } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { language } = useLanguage();

  const menuItems = [
    { id: 'beranda', label: t('home', language), icon: Home, path: '/siswa/home', roles: ['siswa', 'umum'] },
    { id: 'peminjaman', label: t('borrowing', language), icon: Library, path: '/siswa/peminjaman', roles: ['siswa', 'umum'] },
    { id: 'koleksi', label: t('collection', language), icon: BookOpen, path: '/siswa/koleksi', roles: ['siswa', 'umum'], badge: t('new', language) },
    { id: 'katalog', label: t('catalog', language), icon: Book, path: '/siswa/katalog-sastra', roles: ['siswa', 'umum'] },
    { id: 'favorit', label: t('favorites', language), icon: Star, path: '/siswa/favorit', roles: ['siswa', 'umum'] },
    { id: 'history', label: t('history', language), icon: BookOpen, path: '/siswa/transaksi', roles: ['siswa', 'umum'] },
    { id: 'aktivitas', label: t('activity', language), icon: ClipboardList, path: '/siswa/aktivitas', roles: ['siswa', 'umum'] },
    { id: 'eresources', label: t('eResources', language), icon: Laptop, path: '/siswa/e-resources', roles: ['siswa', 'umum'] },
    { id: 'event', label: t('event', language), icon: Sparkles, path: '/siswa/event', roles: ['siswa', 'umum'] },
    { id: 'agenda', label: t('literacyAgenda', language), icon: Calendar, path: '/siswa/agenda-literasi', roles: ['siswa', 'umum'] },
    { id: 'lokasi', label: t('location', language), icon: MapPin, path: '/siswa/lokasi', roles: ['siswa', 'umum'] },
    { id: 'akun', label: t('account', language), icon: User, path: '/siswa/profile', roles: ['siswa', 'umum'] },
  ];

  // Jangan tampilkan sidebar di landing page
  if (pathname === '/') {
    return null;
  }

  // Filter menu berdasarkan role
  const filteredMenu = menuItems.filter(item => {
    if (!session) return false;
    return item.roles.includes(session.user.role);
  });

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    return null;
  }

  return (
    <aside className="w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 sticky top-0 self-start transition-colors duration-300">
      <div className="p-6 h-screen overflow-y-auto">
        {/* Logo & Branding */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/siswa/home" className="flex items-center gap-3">
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('library', language)}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">SMK Taruna Bhakti</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {filteredMenu.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/siswa/home' && pathname?.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`} />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-orange-500 dark:bg-orange-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

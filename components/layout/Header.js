'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllTranslations } from '@/lib/i18n';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Moon, Sun } from 'lucide-react';
import SearchPopup from '@/components/SearchPopup';

export default function Header() {
  // Call all hooks first - Rules of Hooks
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = getAllTranslations(language);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const searchInputRef = useRef(null);

  // Jangan tampilkan header di halaman login dan register
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
      setDebouncedSearchQuery(search);
    }
  }, [searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Show popup when user types in search
    if (searchQuery.trim().length > 0) {
      setShowSearchPopup(true);
    } else {
      setShowSearchPopup(false);
    }
  }, [searchQuery]);

  // Early return AFTER all hooks are called
  if (isAuthPage || isLandingPage) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchPopup(false);
      router.push(`/siswa/koleksi?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowSearchPopup(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchPopup(false);
    router.push('/siswa/koleksi');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
              <Image
                src="/img/logo.png"
                alt="SMK Taruna Bhakti Logo"
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Perpustakaan SMK Taruna Bhakti</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">SMK Taruna Bhakti Library</div>
            </div>
          </div>
          
          {/* Search Bar - Only show for logged in siswa/umum */}
          {session && (session.user.role === 'siswa' || session.user.role === 'umum') && (
            <div className="flex-1 max-w-2xl mx-2 md:mx-4 relative z-50 hidden lg:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder={t.search || 'Cari berdasarkan nama buku...'}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm transition-all relative z-50"
                  style={{ backdropFilter: 'none' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    title="Hapus pencarian"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </form>
              
              {/* Search Dropdown */}
              <SearchPopup
                searchQuery={debouncedSearchQuery}
                isOpen={showSearchPopup}
                onClose={() => setShowSearchPopup(false)}
                inputRef={searchInputRef}
              />
            </div>
          )}
          
          <nav className="flex items-center gap-2 md:gap-3 relative z-10 flex-shrink-0 min-w-fit">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Always show login/register buttons when no session or loading */}
            {!session || status === 'loading' ? (
              <>
                <Link 
                  href="/login" 
                  className="group relative px-4 py-2.5 md:px-6 md:py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Login</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
                <Link
                  href="/register"
                  className="group relative px-4 py-2.5 md:px-6 md:py-3 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold text-sm md:text-base border-2 border-blue-600 dark:border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Daftar</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                {session.user.role === 'staff' ? (
                  <Link 
                    href="/petugas/dashboard" 
                    className="px-3 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 transition-all duration-300 font-medium text-xs md:text-base hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    Dashboard Petugas
                  </Link>
                ) : session.user.role === 'admin' ? (
                  <Link 
                    href="/admin/dashboard" 
                    className="px-3 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300 transition-all duration-300 font-medium text-xs md:text-base hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    Dashboard Admin
                  </Link>
                ) : (
                  // Untuk siswa/umum yang sudah login, tidak perlu menampilkan tombol apapun
                  null
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}


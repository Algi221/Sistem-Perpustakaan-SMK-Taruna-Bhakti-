'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllTranslations } from '@/lib/i18n';
import { Search, X, Info, Calendar, BookOpen, Globe, Mail, MessageCircle } from 'lucide-react';

export default function RightSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { language, changeLanguage } = useLanguage();
  const t = getAllTranslations(language);
  const [searchQuery, setSearchQuery] = useState('');

  // Jangan tampilkan sidebar di landing page
  if (pathname === '/') {
    return null;
  }

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/siswa/koleksi?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang === 'ID' ? 'id' : 'en');
  };

  return (
    <aside className="w-[320px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex-shrink-0 sticky top-0 self-start animate-slide-in transition-colors duration-300">
      <div className="p-6 space-y-6 h-screen overflow-y-auto">
        {/* Search Bar */}
        <div className="mb-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search || 'Cari berdasarkan nama buku...'}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  router.push('/siswa/koleksi');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                title="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>

        {/* Info Box 1 */}
        <div className="bg-white dark:bg-gray-800 border-2 border-orange-400 dark:border-orange-500 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{t.info}</h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {t.followInstagram}
          </p>
          <Link
            href="/siswa/event"
            className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-sm shadow-md hover:shadow-lg"
          >
            <Calendar className="w-4 h-4" />
            <span>{t.eventReservation}</span>
          </Link>
        </div>

        {/* Info Box 2 */}
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-500 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{t.info}</h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {t.cantFindBook}
          </p>
          <Link
            href="/siswa/usul-buku"
            className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-sm shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.bookSuggestion}</span>
          </Link>
        </div>

        {/* Ganti Bahasa */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{t.changeLanguage}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange('ID')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
                language === 'id'
                  ? 'bg-red-500 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 active:scale-95'
              }`}
            >
              <span>🇮🇩</span>
              <span>ID</span>
            </button>
            <button
              onClick={() => handleLanguageChange('EN')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
                language === 'en'
                  ? 'bg-red-500 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 active:scale-95'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
          </div>
        </div>

        {/* Hubungi Kami */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 animate-fade-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base">{t.contactUs}</h3>
          <div className="space-y-2">
            <a
              href="mailto:perpustakaan@smktb.sch.id"
              className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm shadow-sm hover:shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>{t.email}</span>
            </a>
            <a
              href="https://wa.me/6281313899921"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-sm shadow-md hover:shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.whatsapp}</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import BorrowingCard from './BorrowingCard';
import RecommendedBooks from './RecommendedBooks';
import WelcomeMessage from './WelcomeMessage';
import Link from 'next/link';
import { BookOpen, Clock, Book, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TextPressure from '@/components/TextPressure';
import Galaxy from '@/components/Galaxy';

export default function HomePageClient({ borrowings, trendingBooks }) {
  const { language } = useLanguage();

  const pendingCount = borrowings.filter(b => b.status === 'pending').length;
  const borrowedCount = borrowings.filter(b => b.status === 'borrowed').length;
  const returnedCount = borrowings.filter(b => b.status === 'returned').length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 animate-fade-in transition-colors duration-300">
      <div className="p-4 md:p-6">
        {/* Welcome Message with Typing Effect */}
        <WelcomeMessage />

        {/* Stats Cards - Simplified */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover-lift animate-fade-in stagger-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('totalBorrowings', language)}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{borrowings.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-float" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover-lift animate-fade-in stagger-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('pending', language)}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse-slow" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover-lift animate-fade-in stagger-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('borrowed', language)}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{borrowedCount}</p>
              </div>
              <Book className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover-lift animate-fade-in stagger-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('returned', language)}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{returnedCount}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Trending Books Section */}
        {trendingBooks && trendingBooks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('trendingBooks', language)}</h2>
              <Link href="/siswa/koleksi" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors">
                {language === 'id' ? 'Lihat Semua →' : 'View All →'}
              </Link>
            </div>
            <RecommendedBooks initialBooks={trendingBooks} />
          </section>
        )}

        {/* My Borrowings Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('myBorrowings', language)}</h2>
          </div>
          
          {borrowings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">{t('noBorrowings', language)}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">{t('startExploring', language)}</p>
              <Link href="/siswa/koleksi" className="inline-block bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                {t('exploreBooks', language)}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {borrowings.map((borrowing) => (
                <BorrowingCard key={borrowing.id} borrowing={borrowing} />
              ))}
            </div>
          )}
        </section>

        {/* Starbhak TextPressure Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-gray-900 dark:via-black dark:to-gray-900 rounded-2xl mb-6 md:mb-8 py-16 md:py-24 shadow-xl overflow-hidden"
        >
          {/* Galaxy Background */}
          <div className="absolute inset-0 opacity-100 z-0">
            <Galaxy
              mouseRepulsion={true}
              mouseInteraction={true}
              density={1.5}
              glowIntensity={0.4}
              saturation={0.1}
              hueShift={0}
              transparent={true}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent z-[1]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div style={{ 
              position: 'relative', 
              minHeight: '250px',
              height: '300px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '30px 20px',
              overflow: 'visible',
              width: '100%'
            }}>
              <div style={{ 
                width: '100%', 
                maxWidth: '100%',
                height: '100%', 
                overflow: 'visible',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TextPressure
                  text="Starbhak"
                  flex={true}
                  alpha={false}
                  stroke={false}
                  width={true}
                  weight={true}
                  italic={true}
                  textColor="#ffffff"
                  strokeColor="#ff0000"
                  minFontSize={32}
                  scale={false}
                />
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}


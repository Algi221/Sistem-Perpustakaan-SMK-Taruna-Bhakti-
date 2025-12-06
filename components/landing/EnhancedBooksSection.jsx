'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from '@/components/books/BookCard';
import ProtectedButton from './ProtectedButton';
import { Flame, Clock, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EnhancedBooksSection({ 
  allBooks = [], 
  trendingBooks = [], 
  genres = [] 
}) {
  const [activeTab, setActiveTab] = useState('hot');
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Get books by genre
  const getBooksByGenre = (genre) => {
    return allBooks.filter(book => 
      book.genre && book.genre.toLowerCase() === genre.toLowerCase()
    ).slice(0, 10);
  };

  // Get latest books
  const latestBooks = allBooks.slice(0, 10);

  // Get current books to display
  const getCurrentBooks = () => {
    if (activeTab === 'hot') {
      return trendingBooks.length > 0 ? trendingBooks : latestBooks;
    } else if (activeTab === 'latest') {
      return latestBooks;
    } else if (activeTab === 'genre' && selectedGenre) {
      return getBooksByGenre(selectedGenre);
    }
    return latestBooks;
  };

  const currentBooks = getCurrentBooks();

  const tabs = [
    { id: 'hot', label: 'Hot & Populer', icon: Flame, count: trendingBooks.length },
    { id: 'latest', label: 'Terbaru', icon: Clock, count: latestBooks.length },
    { id: 'genre', label: 'Berdasarkan Genre', icon: BookOpen, count: genres.length }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </motion.div>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                Koleksi Buku
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Temukan buku menarik dari berbagai kategori dan genre
            </p>
          </div>
          <ProtectedButton
            href="/siswa/koleksi"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-2 shadow-lg"
          >
            Lihat Semua <span className="group-hover:translate-x-1 transition-transform">→</span>
          </ProtectedButton>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'genre') setSelectedGenre(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Genre Selector (only show when genre tab is active) */}
          {activeTab === 'genre' && genres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGenre === null
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Semua Genre
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedGenre === genre
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Books Grid */}
        <AnimatePresence mode="wait">
          {currentBooks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-700"
            >
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {activeTab === 'genre' && selectedGenre
                  ? `Belum ada buku dengan genre "${selectedGenre}"`
                  : 'Belum ada buku tersedia.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab + selectedGenre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              style={{ gridAutoRows: 'minmax(0, 1fr)' }}
            >
              {currentBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View More Button */}
        {currentBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <Link
              href="/siswa/koleksi"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Lihat Lebih Banyak
              <TrendingUp className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}


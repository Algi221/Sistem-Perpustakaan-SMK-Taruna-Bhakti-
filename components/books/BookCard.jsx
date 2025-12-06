'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, User, Calendar, Tag, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import ProtectedLink from '@/components/ProtectedLink';

export default function BookCard({ book }) {
  const availabilityPercentage = book.stock > 0 ? (book.available / book.stock) * 100 : 0;
  const isAvailable = book.available > 0;
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ProtectedLink href={`/books/${book.id}`} className="h-full block">
      <motion.div
        className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200 dark:border-gray-700 h-full flex flex-col"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Container with Gradient Overlay */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
          {imageError || !book.image_url ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-2" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">No Image</span>
            </div>
          ) : (
            <>
              <Image
                src={book.image_url}
                alt={book.title}
                fill
                className={`object-cover transition-all duration-700 ${
                  isHovered ? 'scale-110 brightness-110' : 'scale-100'
                }`}
                unoptimized
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          )}
          
          {/* Availability Badge */}
          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md ${
              isAvailable 
                ? 'bg-green-500/95 text-white' 
                : 'bg-red-500/95 text-white'
            }`}>
              {isAvailable ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>{isAvailable ? 'Tersedia' : 'Habis'}</span>
            </div>
          </motion.div>

          {/* Hot Badge for Trending Books */}
          {book.borrow_count > 0 && (
            <motion.div
              className="absolute top-4 left-4 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-xl backdrop-blur-md">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Hot</span>
              </div>
            </motion.div>
          )}

          {/* Stock Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              className={`h-full ${
                availabilityPercentage > 50 
                  ? 'bg-green-500' 
                  : availabilityPercentage > 20 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${availabilityPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 bg-white dark:bg-gray-800 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-lg mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight" style={{ minHeight: '3.5rem' }}>
            {book.title}
          </h3>
          
          {/* Author */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4" style={{ minHeight: '1.5rem' }}>
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1 font-medium">{book.author || 'Unknown'}</span>
          </div>
          
          {/* Genre and Year */}
          <div className="flex items-center justify-between mb-4 gap-2" style={{ minHeight: '2rem' }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{book.genre || 'Uncategorized'}</span>
            </div>
            {book.published_year ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                <Calendar className="w-4 h-4" />
                <span>{book.published_year}</span>
              </div>
            ) : (
              <div className="w-12"></div>
            )}
          </div>
          
          {/* Stock Info - Push to bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Stok</span>
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {book.available} <span className="text-gray-500 dark:text-gray-400 font-normal text-sm">/ {book.stock}</span>
            </span>
          </div>
        </div>

        {/* Hover Effect Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>
    </ProtectedLink>
  );
}

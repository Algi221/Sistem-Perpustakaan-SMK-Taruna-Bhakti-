'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Moon, Sun } from 'lucide-react';
import Iridescence from '../../login/components/Iridescence';
import SchoolLogo from '../../login/components/SchoolLogo';

export default function RegisterLayout({ children }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <div className="min-h-screen flex dark:bg-gray-900 transition-colors duration-300">
      {/* Dark Mode Toggle - Fixed Position */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      {/* Left Panel - Promotional */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden"
      >
        {/* Iridescence Background */}
        <Iridescence
          color={[0.2, 0.4, 0.8]}
          mouseReact={true}
          amplitude={0.1}
          speed={1.0}
        />
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white min-h-full">
          {/* School Logo - Centered */}
          <SchoolLogo />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-blue-200 mb-4">You can easily</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight ml-40 text-center mr-40">
              Sudah Berdiri Sejak tahun 2004 
            </h1>
          </motion.div>

          {/* Jurusan Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 w-full"
          >
            <p className="text-sm text-blue-200 mb-4 text-center">Jurusan yang Tersedia</p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { name: 'PPLG', image: '/img/pplg.png' },
                { name: 'TJKT', image: '/img/tjkt.png' },
                { name: 'ANIMASI', image: '/img/animasi.png' },
                { name: 'BRF', image: '/img/brf.png' },
                { name: 'TE', image: '/img/te.png' },
                { name: 'DKV', image: '/img/dkv.png' },
              ].map((jurusan, index) => (
                <motion.div
                  key={jurusan.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20 group-hover:bg-white/20 transition-all shadow-lg">
                    <Image
                      src={jurusan.image}
                      alt={jurusan.name}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs md:text-sm text-white font-semibold text-center">{jurusan.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 p-8 overflow-y-auto transition-colors duration-300"
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

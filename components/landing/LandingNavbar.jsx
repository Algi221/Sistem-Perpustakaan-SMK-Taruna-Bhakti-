'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X, BookOpen, Users, Info, Building2, MessageSquare, FileText, Phone, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import ProtectedButton from './ProtectedButton';

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { data: session } = useSession();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Detect active section
      const sections = ['beranda', 'katalog', 'tentang', 'fasilitas', 'testimoni', 'blog', 'kontak'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    if (sectionId === 'beranda') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Offset untuk navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'beranda', label: 'Beranda', icon: BookOpen },
    { id: 'katalog', label: 'Katalog', icon: BookOpen },
    { id: 'fasilitas', label: 'Fasilitas', icon: Building2 },
    { id: 'tentang', label: 'Tentang', icon: Info },
    { id: 'testimoni', label: 'Testimoni', icon: MessageSquare },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'kontak', label: 'Kontak', icon: Phone },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 md:gap-3 cursor-pointer"
            onClick={() => scrollToSection('beranda')}
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12">
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
              <div className={`text-sm md:text-lg font-bold transition-colors ${
                isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
              }`}>
                Perpustakaan Digital
              </div>
              <div className={`text-xs md:text-sm transition-colors ${
                isScrolled ? 'text-gray-600 dark:text-gray-400' : 'text-white/80'
              }`}>
                SMK Taruna Bhakti
              </div>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? isScrolled
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-white bg-white/20'
                      : isScrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Login/Register Buttons */}
            {!session ? (
              <>
                <Link
                  href="/login"
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isScrolled
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                  }`}
                >
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isScrolled
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                      : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-white shadow-md hover:shadow-lg'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Daftar</span>
                </Link>
              </>
            ) : (
              <ProtectedButton
                href="/siswa/koleksi"
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isScrolled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Masuk</span>
              </ProtectedButton>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'bg-white/20 text-white'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                {!session ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="w-4 h-4" />
                      <span>Daftar</span>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/siswa/koleksi');
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Masuk ke Dashboard</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}


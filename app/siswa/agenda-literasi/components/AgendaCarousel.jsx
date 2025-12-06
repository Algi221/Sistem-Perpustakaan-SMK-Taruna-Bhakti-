'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['Hari Ini', 'Aktivitas Literasi', 'Seremoni', 'Story Telling', 'Seminar', 'Aksi Komunitas'];

const agendaItems = [
  {
    id: 1,
    title: 'Pemberdayaan Duta Baca SMK Taruna Bhakti',
    date: 'Kamis, 20 November 2025',
    time: '08:30 WIB - Selesai',
    location: 'SLB Negeri 3',
    category: 'Aktivitas Literasi',
    activities: [
      'Dongeng Seru bersama Kak Canyo',
      'Literasi: Aktivitas Cerita bersama SLB Negeri 3',
      'Baca Seru bersama Mobil Literasi (MOLI)'
    ]
  },
  {
    id: 2,
    title: 'Roadshow Pelaksanaan Konser Baca SMK Taruna Bhakti II',
    date: 'Kamis, 20 November 2025',
    time: '14:00 WIB - Selesai',
    location: 'SLB Negeri 3',
    category: 'Seminar',
    activities: [
      'Dongeng Seru bersama Kak Puc',
      'Pergundian Doorprize 5 Unit Sepeda'
    ]
  },
  {
    id: 3,
    title: 'Book Camp 2025: Level Up Your Literacy',
    date: 'Sabtu, 22 November 2025',
    time: '09:00 - 17:00 WIB',
    location: 'Perpustakaan SMK Taruna Bhakti',
    category: 'Seminar',
    activities: [
      'DUTA BACA SMA/SMK/MA Level Up Your Literacy'
    ]
  },
  {
    id: 4,
    title: 'Upacara Pembukaan Tahun Ajaran Baru',
    date: 'Senin, 15 Juli 2025',
    time: '07:00 - 08:00 WIB',
    location: 'Lapangan SMK Taruna Bhakti',
    category: 'Seremoni',
    activities: [
      'Upacara Bendera',
      'Sambutan Kepala Sekolah',
      'Pengenalan Program Literasi'
    ]
  },
  {
    id: 5,
    title: 'Story Telling Session: Petualangan Si Kancil',
    date: 'Rabu, 25 November 2025',
    time: '10:00 - 11:30 WIB',
    location: 'Perpustakaan SMK Taruna Bhakti',
    category: 'Story Telling',
    activities: [
      'Dongeng Interaktif',
      'Sesi Tanya Jawab',
      'Workshop Menulis Cerita Pendek'
    ]
  },
  {
    id: 6,
    title: 'Aksi Komunitas: Donasi Buku untuk Desa',
    date: 'Minggu, 30 November 2025',
    time: '08:00 - 12:00 WIB',
    location: 'Desa Sukamaju',
    category: 'Aksi Komunitas',
    activities: [
      'Pengumpulan Buku Donasi',
      'Distribusi Buku ke Perpustakaan Desa',
      'Kegiatan Membaca Bersama'
    ]
  }
];

export default function AgendaCarousel() {
  const [selectedCategory, setSelectedCategory] = useState('Hari Ini');
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const filteredAgenda = selectedCategory === 'Hari Ini' 
    ? agendaItems.filter(item => item.date.includes('20 November'))
    : agendaItems.filter(item => item.category === selectedCategory);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    // Initial check
    setTimeout(checkScrollability, 100);
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [selectedCategory]);

  // Auto-scroll to selected category
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedIndex = categories.indexOf(selectedCategory);
      const container = scrollContainerRef.current;
      const buttons = container.querySelectorAll('button');
      if (buttons[selectedIndex]) {
        const button = buttons[selectedIndex];
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const containerWidth = container.clientWidth;
        const scrollLeft = container.scrollLeft;
        
        // Check if button is not fully visible
        if (buttonLeft < scrollLeft) {
          // Button is to the left, scroll to show it
          container.scrollTo({ left: buttonLeft - 20, behavior: 'smooth' });
        } else if (buttonLeft + buttonWidth > scrollLeft + containerWidth) {
          // Button is to the right, scroll to show it
          container.scrollTo({ left: buttonLeft + buttonWidth - containerWidth + 20, behavior: 'smooth' });
        }
      }
      // Recheck scrollability after scroll
      setTimeout(checkScrollability, 300);
    }
  }, [selectedCategory]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = categories.indexOf(selectedCategory);
      if (isLeftSwipe && currentIndex < categories.length - 1) {
        setSelectedCategory(categories[currentIndex + 1]);
      }
      if (isRightSwipe && currentIndex > 0) {
        setSelectedCategory(categories[currentIndex - 1]);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Category Tabs with Scroll */}
      <div 
        className="relative mb-6"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center gap-2">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          
          {/* Scrollable Category Tabs */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={checkScrollability}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Agenda Items with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {filteredAgenda.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Tidak ada agenda untuk kategori "{selectedCategory}"</p>
            </div>
          ) : (
            filteredAgenda.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{item.date}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{item.time}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{item.location}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold whitespace-nowrap">
                    {item.category}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Aktivitas:</h4>
                  <ul className="space-y-1">
                    {item.activities.map((activity, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users } from 'lucide-react';
import TextType from '@/components/TextType';
import Galaxy from '@/components/Galaxy';
import ProtectedButton from '@/components/landing/ProtectedButton';
import GenreLoop from '@/components/landing/GenreLoop';
import BlogSection from '@/components/landing/BlogSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import AboutSection from '@/components/landing/AboutSection';
import ContactSection from '@/components/landing/ContactSection';
import EnhancedBooksSection from '@/components/landing/EnhancedBooksSection';
import Footer from '@/components/landing/Footer';
import LandingNavbar from '@/components/landing/LandingNavbar';
import CountUp from '@/components/landing/CountUp';

export default function LandingPageClient({ books, trendingBooks, genres, stats }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Landing Navbar */}
      <LandingNavbar />
      
      {/* Hero Section */}
      <div id="beranda" className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-20 md:py-32 shadow-2xl overflow-hidden pt-32 md:pt-40">
        {/* Galaxy Background */}
        <div className="absolute inset-0 opacity-100">
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
        
        {/* Animated Background Overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gray-800 rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-700 rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gray-800 rounded-full mix-blend-overlay filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-10 flex justify-center"
            >
              <div className="relative w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72">
                <Image
                  src="/img/logo.png"
                  alt="SMK Taruna Bhakti Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  unoptimized
                  priority
                />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent drop-shadow-2xl leading-tight"
            >
              Perpustakaan Digital
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl lg:text-3xl text-blue-50 mb-4 font-light"
            >
              SMK Taruna Bhakti
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto min-h-[60px] flex items-center justify-center"
            >
              <TextType
                text={[
                  "Jelajahi ribuan koleksi buku digital dari berbagai genre",
                  "Akses kapan saja, di mana saja",
                  "Temukan buku favoritmu dengan mudah",
                  "Happy reading! 📚"
                ]}
                typingSpeed={75}
                pauseDuration={2000}
                showCursor={true}
                cursorCharacter="|"
                className="text-center"
                textColors={['#dbeafe', '#bfdbfe', '#93c5fd']}
              />
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <ProtectedButton
                href="/siswa/koleksi"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 shadow-lg"
              >
                <BookOpen className="w-5 h-5" />
                Jelajahi Koleksi
              </ProtectedButton>
              <Link
                href="/register"
                className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 border-2 border-blue-400 shadow-lg"
              >
                <Users className="w-5 h-5" />
                Daftar Sekarang
              </Link>
            </motion.div>
            
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 text-white">
                  <CountUp
                    from={0}
                    to={stats.totalBooks}
                    separator=","
                    direction="up"
                    duration={1.5}
                    className="count-up-text"
                  />
                  <span>+</span>
                </div>
                <div className="text-sm text-blue-100">Total Buku</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 text-white">
                  <CountUp
                    from={0}
                    to={genres.length}
                    separator=","
                    direction="up"
                    duration={1.5}
                    className="count-up-text"
                  />
                  <span>+</span>
                </div>
                <div className="text-sm text-blue-100">Genre</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 text-white">
                  <CountUp
                    from={0}
                    to={stats.totalUsers}
                    separator=","
                    direction="up"
                    duration={1.5}
                    className="count-up-text"
                  />
                  <span>+</span>
                </div>
                <div className="text-sm text-blue-100">Pengguna</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 text-white">24/7</div>
                <div className="text-sm text-blue-100">Akses</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Books Section */}
      <div id="katalog" className="scroll-mt-20">
        <EnhancedBooksSection 
          allBooks={books}
          trendingBooks={trendingBooks}
          genres={genres}
        />
      </div>

      {/* Genre Tags with LogoLoop */}
      {genres.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 transition-colors duration-300"
        >
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center"
          >
            Jelajahi Berdasarkan Genre
          </motion.h3>
          <GenreLoop genres={genres} />
        </motion.section>
      )}

      {/* Fasilitas Section */}
      <motion.section
        id="fasilitas"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900 transition-colors duration-300 scroll-mt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Fasilitas SMK Taruna Bhakti</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Lihat berbagai fasilitas modern yang tersedia di sekolah kami
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Main Large Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2 md:col-span-2 lg:col-span-2 row-span-2 relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg group"
          >
            <Image
              src="/img/lapangan.png"
              alt="Fasilitas Utama SMK Taruna Bhakti"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                <h3 className="text-base md:text-lg font-bold mb-1">Fasilitas Lengkap</h3>
                <p className="text-white/90 text-xs md:text-sm">Ruang kelas modern dengan teknologi terkini</p>
              </div>
            </div>
          </motion.div>
          
          {/* Smaller Images */}
          {[
            { src: '/img/Laboratorium Komputer.png', alt: 'Laboratorium Komputer', title: 'Laboratorium Komputer' },
            { src: '/img/Perpustakaan.png', alt: 'Perpustakaan', title: 'Perpustakaan' },
            { src: '/img/Ruang Praktik.png', alt: 'Ruang Praktik', title: 'Ruang Praktik' },
            { src: '/img/Studio BRF.png', alt: 'Studio BRF', title: 'Studio BRF' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg group"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
                onError={(e) => {
                  // Fallback ke placeholder jika gambar tidak ditemukan
                  e.target.src = `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 text-white">
                  <h3 className="text-xs md:text-sm font-bold">{item.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* About Section */}
      <div id="tentang" className="scroll-mt-20">
        <AboutSection />
      </div>

      {/* Testimonial Section */}
      <div id="testimoni" className="scroll-mt-20">
        <TestimonialSection />
      </div>

      {/* Blog Section */}
      <div id="blog" className="scroll-mt-20">
        <BlogSection />
      </div>

      {/* Contact Section */}
      <div id="kontak" className="scroll-mt-20">
        <ContactSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}


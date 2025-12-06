'use client';

import { motion } from 'framer-motion';
import { Star, Quote, User, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Ahmad Rizki',
    role: 'Siswa Kelas XII',
    content: 'Perpustakaan digital ini sangat membantu saya dalam mencari referensi untuk tugas. Koleksi bukunya lengkap dan mudah diakses kapan saja.',
    rating: 5,
    avatar: '👨‍🎓'
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    role: 'Siswa Kelas XI',
    content: 'Saya suka sekali dengan fitur favorit dan keranjang. Membuat saya bisa mengorganisir buku-buku yang ingin saya baca dengan mudah.',
    rating: 5,
    avatar: '👩‍🎓'
  },
  {
    id: 3,
    name: 'Budi Santoso',
    role: 'Siswa Kelas X',
    content: 'Interface-nya sangat user-friendly dan modern. Proses peminjaman buku juga cepat dan tidak ribet. Recommended!',
    rating: 5,
    avatar: '👨‍🎓'
  },
  {
    id: 4,
    name: 'Dewi Lestari',
    role: 'Siswa Kelas XII',
    content: 'Sebagai pecinta buku, saya sangat senang dengan koleksi yang ada. Genre-nya beragam dan selalu update dengan buku terbaru.',
    rating: 5,
    avatar: '👩‍🎓'
  },
  {
    id: 5,
    name: 'Rizki Pratama',
    role: 'Siswa Kelas XI',
    content: 'Sistem peminjaman yang sangat efisien. Saya bisa memesan buku dari rumah dan mengambilnya di sekolah. Sangat praktis!',
    rating: 5,
    avatar: '👨‍🎓'
  },
  {
    id: 6,
    name: 'Putri Sari',
    role: 'Siswa Kelas X',
    content: 'E-resources yang tersedia sangat membantu untuk belajar. Bisa akses kapan saja dan di mana saja. Terima kasih!',
    rating: 5,
    avatar: '👩‍🎓'
  }
];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Quote className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Testimoni Pengguna
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Lihat apa kata mereka tentang perpustakaan digital kami
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial, index) => {
            const isActive = index === currentIndex;
            const delay = index * 0.1;
            
            return (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
                onClick={() => setCurrentIndex(index)}
                className={`group relative cursor-pointer ${
                  isActive ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                    isActive
                      ? 'border-blue-500 dark:border-blue-400 shadow-blue-200 dark:shadow-blue-900/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Quote className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Rating Stars */}
                  <div className="flex justify-start mb-4 gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          isActive
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-yellow-300 text-yellow-300 group-hover:fill-yellow-400 group-hover:text-yellow-400'
                        } transition-colors`}
                      />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className={`text-gray-700 dark:text-gray-300 mb-6 line-clamp-4 group-hover:line-clamp-none transition-all ${
                    isActive ? 'text-base' : 'text-sm'
                  }`}>
                    "{testimonial.content}"
                  </p>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTestimonial"
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.3 }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  )}

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-2 mt-6"
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-2'
                  : 'w-2 h-2 hover:w-4'
              } rounded-full ${
                index === currentIndex
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

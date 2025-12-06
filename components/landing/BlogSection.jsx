'use client';

import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: 'Tips Membaca Efektif untuk Meningkatkan Pemahaman',
    excerpt: 'Pelajari teknik-teknik membaca yang efektif untuk meningkatkan pemahaman dan retensi informasi dari buku yang Anda baca.',
    author: 'Admin Perpustakaan',
    date: '15 Januari 2025',
    image: '/img/tips.jpg',
    category: 'Tips & Trik'
  },
  {
    id: 2,
    title: '5 Buku Rekomendasi untuk Pengembangan Diri',
    excerpt: 'Daftar buku terbaik yang dapat membantu Anda dalam pengembangan diri dan mencapai tujuan hidup.',
    author: 'Tim Literasi',
    date: '10 Januari 2025',
    image: '/img/rekomendasi.png',
    category: 'Rekomendasi'
  },
  {
    id: 3,
    title: 'Manfaat Membaca Buku Digital di Era Modern',
    excerpt: 'Temukan berbagai keuntungan membaca buku digital dan bagaimana teknologi dapat meningkatkan pengalaman membaca Anda.',
    author: 'Admin Perpustakaan',
    date: '5 Januari 2025',
    image: '/img/Alasan.jpg',
    category: 'Teknologi'
  }
];

export default function BlogSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Blog & Artikel
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Dapatkan tips, rekomendasi buku, dan informasi terbaru seputar literasi dan pendidikan
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                  onError={(e) => {
                    // Fallback ke placeholder jika gambar tidak ditemukan
                    e.target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
                
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all group/link"
                >
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href="#"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Lihat Semua Artikel
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}



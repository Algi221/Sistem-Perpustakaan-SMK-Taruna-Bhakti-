'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, Award, Target, Heart } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: BookOpen,
    title: 'Koleksi Lengkap',
    description: 'Ribuan buku digital dari berbagai genre tersedia untuk Anda'
  },
  {
    icon: Users,
    title: 'Akses Mudah',
    description: 'Sistem yang user-friendly dan dapat diakses kapan saja, di mana saja'
  },
  {
    icon: Clock,
    title: 'Tersedia 24/7',
    description: 'Perpustakaan digital selalu siap melayani kebutuhan literasi Anda'
  },
  {
    icon: Award,
    title: 'Kualitas Terjamin',
    description: 'Buku-buku berkualitas tinggi dari penerbit terpercaya'
  },
  {
    icon: Target,
    title: 'Pencarian Cepat',
    description: 'Temukan buku yang Anda cari dengan mudah menggunakan fitur pencarian'
  },
  {
    icon: Heart,
    title: 'Gratis',
    description: 'Akses semua koleksi buku secara gratis untuk seluruh anggota'
  }
];

export default function AboutSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Tentang Perpustakaan Digital
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">
            Perpustakaan Digital SMK Taruna Bhakti adalah platform modern yang menyediakan akses 
            mudah ke ribuan koleksi buku digital. Kami berkomitmen untuk meningkatkan minat baca 
            dan literasi digital di kalangan siswa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="bg-blue-600 dark:bg-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/img/image.png"
              alt="Perpustakaan Digital SMK Taruna Bhakti"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Visi & Misi
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Visi
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Menjadi perpustakaan digital terdepan yang mendukung pengembangan literasi 
                  dan pendidikan di SMK Taruna Bhakti.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Misi
                </h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
                  <li>Menyediakan akses mudah ke koleksi buku digital berkualitas</li>
                  <li>Meningkatkan minat baca dan literasi digital siswa</li>
                  <li>Mendukung proses pembelajaran dengan sumber referensi yang lengkap</li>
                  <li>Mengembangkan budaya membaca di lingkungan sekolah</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



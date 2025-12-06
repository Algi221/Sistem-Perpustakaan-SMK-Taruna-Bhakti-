'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function ContactSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Hubungi Kami
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Ada pertanyaan atau butuh bantuan? Jangan ragu untuk menghubungi kami
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Alamat
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Jl. Pekapuran, RT.02/RW.06, Cimanggis, Depok, Jawa Barat 16953
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Telepon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              (021) 460-1234
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              (+62) 811-9892-324
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Email
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              perpustakaan@smktb.sch.id
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              info@smktb.sch.id
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="bg-orange-100 dark:bg-orange-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Jam Operasional
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Senin - Jumat: 07:00 - 16:00
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sabtu: 08:00 - 12:00
            </p>
          </motion.div>
        </div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Ikuti Kami di Media Sosial
          </h3>
          <div className="flex justify-center gap-4">
            {[
              { icon: Facebook, href: '#', label: 'Facebook' },
              { icon: Instagram, href: '#', label: 'Instagram' },
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: Youtube, href: '#', label: 'YouTube' }
            ].map((social, index) => {
              const Icon = social.icon;
              return (
                <Link
                  key={index}
                  href={social.href}
                  className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}



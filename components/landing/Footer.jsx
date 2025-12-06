'use client';

import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/img/logo.png"
                  alt="SMK Taruna Bhakti Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-white font-bold text-lg">Perpustakaan Digital</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Platform perpustakaan digital modern untuk mendukung literasi dan pendidikan 
              di SMK Taruna Bhakti.
            </p>
            <div className="flex gap-3">
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
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/siswa/koleksi" className="hover:text-blue-400 transition-colors">
                  Koleksi Buku
                </Link>
              </li>
              <li>
                <Link href="/siswa/agenda-literasi" className="hover:text-blue-400 transition-colors">
                  Agenda Literasi
                </Link>
              </li>
              <li>
                <Link href="/siswa/event" className="hover:text-blue-400 transition-colors">
                  Event & Kegiatan
                </Link>
              </li>
              <li>
                <Link href="/siswa/e-resources" className="hover:text-blue-400 transition-colors">
                  E-Resources
                </Link>
              </li>
              <li>
                <Link href="/siswa/jadwal-pusling" className="hover:text-blue-400 transition-colors">
                  Jadwal Pusling
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Informasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-blue-400 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400 transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-400 transition-colors">
                  Bantuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400">
                  Jl. Raya Bekasi Km. 22, Cakung, Jakarta Timur 13910
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400">(021) 460-1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400">perpustakaan@smktb.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} Perpustakaan Digital SMK Taruna Bhakti. All rights reserved.
            </p>
            <p>
              Dibuat dengan <span className="text-red-500">❤️</span> untuk literasi Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}



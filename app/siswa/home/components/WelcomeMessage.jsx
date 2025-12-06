'use client';

import TextType from '@/components/TextType';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { Hand } from 'lucide-react';

export default function WelcomeMessage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const userName = session?.user?.name || (language === 'id' ? 'Pengguna' : 'User');

  const welcomeTexts = language === 'id' 
    ? [
        "Jelajahi koleksi buku terbaru hari ini",
        "Temukan buku favoritmu di perpustakaan digital",
        "Baca kapan saja, di mana saja",
        "Happy reading!"
      ]
    : [
        "Explore the latest book collection today",
        "Find your favorite books in the digital library",
        "Read anytime, anywhere",
        "Happy reading!"
      ];

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2">
          {language === 'id' ? `Selamat Datang, ${userName}!` : `Welcome, ${userName}!`} <Hand className="w-6 h-6 md:w-7 md:h-7" />
        </h1>
        <div className="text-base md:text-lg text-blue-50 min-h-[60px] flex items-center">
          <TextType
            text={welcomeTexts}
            typingSpeed={60}
            pauseDuration={2000}
            showCursor={true}
            cursorCharacter="|"
            textColors={['#dbeafe', '#bfdbfe', '#93c5fd']}
          />
        </div>
      </div>
    </div>
  );
}


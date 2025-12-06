'use client';

import LogoLoop from '@/components/LogoLoop';
import ProtectedLink from '@/components/ProtectedLink';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function GenreLoop({ genres }) {
  const { darkMode } = useDarkMode();
  
  if (!genres || genres.length === 0) return null;

  return (
    <div style={{ height: '80px', position: 'relative', overflow: 'hidden' }}>
      <LogoLoop
        logos={genres.map(genre => ({
          title: genre,
          href: `/siswa/koleksi?genre=${encodeURIComponent(genre)}`
        }))}
        speed={80}
        direction="left"
        logoHeight={48}
        gap={24}
        hoverSpeed={20}
        fadeOut={true}
        fadeOutColor={darkMode ? '#111827' : '#ffffff'}
        scaleOnHover={true}
        ariaLabel="Genre categories"
        renderItem={(item, key) => (
          <ProtectedLink
            href={item.href}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 whitespace-nowrap inline-block"
          >
            {item.title}
          </ProtectedLink>
        )}
      />
    </div>
  );
}


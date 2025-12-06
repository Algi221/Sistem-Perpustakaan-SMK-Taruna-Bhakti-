'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FontSizeProvider } from '@/contexts/FontSizeContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import SessionManager from '@/components/SessionManager';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <FontSizeProvider>
          <DarkModeProvider>
            <ToastProvider>
              <SessionManager />
              {children}
            </ToastProvider>
          </DarkModeProvider>
        </FontSizeProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}


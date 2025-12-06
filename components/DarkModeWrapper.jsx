'use client';

import Header from '@/components/layout/Header';
import MainLayout from '@/components/MainLayout';

export default function DarkModeWrapper({ children }) {
  return (
    <>
      <Header />
      <MainLayout>
        {children}
      </MainLayout>
    </>
  );
}


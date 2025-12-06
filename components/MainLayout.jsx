'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import NotificationToast from './NotificationToast';
import MessageCenter from './MessageCenter';

export default function MainLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Jangan tampilkan sidebar di halaman login, register, dan landing page
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isLandingPage = pathname === '/';
  
  // Tampilkan layout dengan sidebar hanya untuk user (siswa/umum) dan bukan di halaman auth atau landing page
  const showSidebar = !isAuthPage && !isLandingPage && session && (session.user.role === 'siswa' || session.user.role === 'umum');

  if (!showSidebar) {
    return (
      <>
        {children}
        {session && (session.user.role === 'siswa' || session.user.role === 'umum') && <NotificationToast />}
      </>
    );
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Left Sidebar - Sticky, follows scroll */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="w-full">
          {children}
        </div>
      </main>
      
      {/* Right Sidebar - Sticky, follows scroll */}
      <RightSidebar />
      
      {/* Notification Toast */}
      <NotificationToast />
      
      {/* Message Center */}
      <MessageCenter />
    </div>
  );
}

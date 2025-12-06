'use client';

import StaffSidebar from '@/components/staff/StaffSidebar';
import NotificationToast from '@/components/NotificationToast';

export default function StaffDashboardLayoutClient({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="flex">
        <StaffSidebar />
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
      <NotificationToast />
    </div>
  );
}


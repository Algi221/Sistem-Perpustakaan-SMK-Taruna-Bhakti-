'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminDashboardLayoutClient({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}


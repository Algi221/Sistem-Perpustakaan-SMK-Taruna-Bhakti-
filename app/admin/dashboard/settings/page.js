import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSettings from '@/components/admin/AdminSettings';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Setting
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Pengaturan sistem</p>
      </div>
      <AdminSettings />
    </div>
  );
}


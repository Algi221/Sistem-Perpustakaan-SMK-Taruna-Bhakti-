import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AgendaCarousel from './components/AgendaCarousel';

export default async function AgendaLiterasiPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agenda Literasi</h1>
        <p className="text-gray-600 dark:text-gray-400">Ada apa di Perpustakaan SMK Taruna Bhakti?</p>
      </div>

      <AgendaCarousel />
    </div>
  );
}


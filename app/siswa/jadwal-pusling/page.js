import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const schedules = [
  {
    id: 1,
    day: 'Senin',
    location: 'SMK Taruna Bhakti',
    time: '08:00 - 15:00 WIB',
    address: 'Jl. Merdeka Selatan No. 11'
  },
  {
    id: 2,
    day: 'Selasa',
    location: 'SMK Taruna Bhakti - Selatan',
    time: '08:00 - 15:00 WIB',
    address: 'Jl. Raya Pasar Minggu'
  },
  {
    id: 3,
    day: 'Rabu',
    location: 'SMK Taruna Bhakti - Barat',
    time: '08:00 - 15:00 WIB',
    address: 'Jl. Kembangan Raya'
  },
  {
    id: 4,
    day: 'Kamis',
    location: 'SMK Taruna Bhakti - Timur',
    time: '08:00 - 15:00 WIB',
    address: 'Jl. Raya Bekasi'
  },
  {
    id: 5,
    day: 'Jumat',
    location: 'SMK Taruna Bhakti - Utara',
    time: '08:00 - 15:00 WIB',
    address: 'Jl. Pluit Raya'
  }
];

export default async function JadwalPuslingPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Jadwal Pusling</h1>
        <p className="text-gray-600 dark:text-gray-400">Jadwal kunjungan Perpustakaan Keliling (Pusling)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚐</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{schedule.day}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{schedule.location}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span>⏰</span>
                <span className="font-semibold">{schedule.time}</span>
              </p>
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span>📍</span>
                <span>{schedule.address}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


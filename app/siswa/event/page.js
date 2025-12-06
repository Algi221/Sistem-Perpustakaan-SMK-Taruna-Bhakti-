import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const events = [
  {
    id: 1,
    title: 'Book Camp 2025: Level Up Your Literacy',
    date: '20 November 2025',
    time: '09:00 - 17:00 WIB',
    location: 'Perpustakaan SMK Taruna Bhakti',
    category: 'Seminar',
    image: 'https://via.placeholder.com/400x200?text=Book+Camp+2025'
  },
  {
    id: 2,
    title: 'Story Telling Session',
    date: '25 November 2025',
    time: '14:00 - 16:00 WIB',
    location: 'Perpustakaan SMK Taruna Bhakti',
    category: 'Story Telling',
    image: 'https://via.placeholder.com/400x200?text=Story+Telling'
  },
  {
    id: 3,
    title: 'Literacy Community Action',
    date: '30 November 2025',
    time: '10:00 - 15:00 WIB',
    location: 'Perpustakaan SMK Taruna Bhakti',
    category: 'Aksi Komunitas',
    image: 'https://via.placeholder.com/400x200?text=Community+Action'
  }
];

export default async function EventPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event</h1>
        <p className="text-gray-600 dark:text-gray-400">Acara dan kegiatan literasi di perpustakaan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl">
              {event.title.charAt(0)}
            </div>
            <div className="p-6">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold mb-3">
                {event.category}
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{event.title}</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{event.date}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>⏰</span>
                  <span>{event.time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{event.location}</span>
                </p>
              </div>
              <Link
                href={`/siswa/event/${event.id}`}
                className="block w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Reservasi
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


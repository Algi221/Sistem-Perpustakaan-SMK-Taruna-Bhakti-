import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const eResources = [
  {
    id: 1,
    title: 'E-Books Collection',
    description: 'Akses ribuan e-book dari berbagai genre',
    icon: '📖',
    color: 'blue',
    link: '#'
  },
  {
    id: 2,
    title: 'E-Journals',
    description: 'Jurnal elektronik dari berbagai bidang ilmu',
    icon: '📄',
    color: 'green',
    link: '#'
  },
  {
    id: 3,
    title: 'Database Online',
    description: 'Akses database penelitian dan referensi',
    icon: '💾',
    color: 'purple',
    link: '#'
  },
  {
    id: 4,
    title: 'Video Learning',
    description: 'Video pembelajaran dan tutorial',
    icon: '🎥',
    color: 'red',
    link: '#'
  },
  {
    id: 5,
    title: 'Audio Books',
    description: 'Buku audio untuk didengarkan',
    icon: '🎧',
    color: 'orange',
    link: '#'
  },
  {
    id: 6,
    title: 'Research Tools',
    description: 'Alat bantu penelitian dan penulisan',
    icon: '🔬',
    color: 'teal',
    link: '#'
  }
];

export default async function EResourcesPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">E-Resources</h1>
        <p className="text-gray-600 dark:text-gray-400">Akses sumber daya elektronik perpustakaan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eResources.map((resource) => (
          <Link
            key={resource.id}
            href={resource.link}
            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-400 dark:hover:border-blue-500"
          >
            <div className={`w-16 h-16 rounded-full bg-${resource.color}-100 dark:bg-${resource.color}-900/30 flex items-center justify-center mb-4 text-3xl`}>
              {resource.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{resource.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}


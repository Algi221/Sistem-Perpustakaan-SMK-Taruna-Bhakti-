import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';

async function getActivities(userId) {
  try {
    const [activities] = await pool.execute(
      `SELECT 
        'borrowing' as type,
        b.created_at as activity_date,
        CONCAT('Meminjam buku: ', bk.title) as description,
        bk.image_url as image
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.user_id = ?
       
       UNION ALL
       
       SELECT 
        'favorite' as type,
        f.created_at as activity_date,
        CONCAT('Menambahkan ke favorit: ', bk.title) as description,
        bk.image_url as image
       FROM favorites f
       JOIN books bk ON f.book_id = bk.id
       WHERE f.user_id = ?
       
       ORDER BY activity_date DESC
       LIMIT 50`,
      [userId, userId]
    );
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

export default async function AktivitasPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const activities = await getActivities(session.user.id);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Aktivitas</h1>
        <p className="text-gray-600 dark:text-gray-400">Riwayat aktivitas Anda di perpustakaan</p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Belum ada aktivitas</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Aktivitas Anda akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                activity.type === 'borrowing' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <span className="text-2xl">
                  {activity.type === 'borrowing' ? '📚' : '⭐'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{activity.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(activity.activity_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileTabs from './components/ProfileTabs';
import pool from '@/lib/db';

async function getUserProfile(userId) {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return users[0] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

async function getBorrowingsForCalendar(userId) {
  try {
    const [borrowings] = await pool.execute(
      `SELECT b.*, bk.title, bk.author, bk.image_url 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.user_id = ? 
       ORDER BY b.borrow_date DESC`,
      [userId]
    );
    return borrowings;
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return [];
  }
}

export default async function ProfilePage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const userProfile = await getUserProfile(session.user.id);
  const borrowings = await getBorrowingsForCalendar(session.user.id);

  if (!userProfile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-3xl md:text-4xl">👤</span>
                </div>
                <span>Profil Saya</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mt-2">Kelola informasi dan aktivitas Anda</p>
            </div>
          </div>
          
          <div className="animate-scale-in">
            <ProfileTabs userProfile={userProfile} borrowings={borrowings} />
          </div>
        </div>
      </div>
    </div>
  );
}


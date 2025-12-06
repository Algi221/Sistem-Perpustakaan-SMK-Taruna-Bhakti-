import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import BorrowingCard from './components/BorrowingCard';

async function getBorrowings(userId) {
  try {
    const [borrowings] = await pool.execute(
      `SELECT b.*, bk.title, bk.author, bk.image_url, bk.genre 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return borrowings;
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const borrowings = await getBorrowings(session.user.id);

  const pendingCount = borrowings.filter(b => b.status === 'pending').length;
  const borrowedCount = borrowings.filter(b => b.status === 'borrowed').length;
  const returnedCount = borrowings.filter(b => b.status === 'returned').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dashboard Saya
          </h1>
          <p className="text-gray-600">Kelola peminjaman buku Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Peminjaman</p>
                <p className="text-3xl font-bold">{borrowings.length}</p>
              </div>
              <div className="text-4xl opacity-80">📚</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Menunggu</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <div className="text-4xl opacity-80">⏳</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Dipinjam</p>
                <p className="text-3xl font-bold">{borrowedCount}</p>
              </div>
              <div className="text-4xl opacity-80">📖</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm mb-1">Dikembalikan</p>
                <p className="text-3xl font-bold">{returnedCount}</p>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <span>Informasi Akun</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-semibold text-gray-800">{session.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📧</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">{session.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🎭</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold text-gray-800">
                  {session.user.role === 'siswa' ? 'Siswa' : 'Umum'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Borrowings Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>📖</span>
              <span>Riwayat Peminjaman</span>
            </h2>
          </div>
          
          {borrowings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg mb-2">Anda belum meminjam buku apapun.</p>
              <p className="text-gray-400 text-sm">Mulai jelajahi koleksi buku kami!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {borrowings.map((borrowing) => (
                <BorrowingCard key={borrowing.id} borrowing={borrowing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


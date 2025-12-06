import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import BorrowingCard from '../home/components/BorrowingCard';

async function getTransactions(userId) {
  try {
    const [transactions] = await pool.execute(
      `SELECT b.*, bk.title, bk.author, bk.image_url, bk.genre 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.id 
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export default async function TransaksiPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
    redirect('/login');
  }

  const transactions = await getTransactions(session.user.id);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">History Peminjaman</h1>
        <p className="text-gray-600 dark:text-gray-400">Riwayat semua transaksi peminjaman Anda</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl animate-fade-in transition-colors duration-300">
          <div className="text-6xl mb-4 animate-float">📚</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Belum ada history peminjaman</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Riwayat peminjaman akan muncul di sini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <BorrowingCard borrowing={transaction} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


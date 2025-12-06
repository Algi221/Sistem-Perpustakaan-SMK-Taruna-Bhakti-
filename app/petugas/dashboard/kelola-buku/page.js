import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import KelolaBuku from '@/components/staff/KelolaBuku';

async function getBooks() {
  try {
    const [books] = await pool.execute(
      'SELECT * FROM books ORDER BY created_at DESC'
    );
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export default async function KelolaBukuPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const books = await getBooks();

  return <KelolaBuku initialBooks={books} />;
}


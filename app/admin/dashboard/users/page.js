import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import UserManagementClient from './user-management-client';

async function getUsers() {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default async function UsersPage() {
  const session = await getSession();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const users = await getUsers();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Data User
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola data pengguna sistem</p>
      </div>
      <UserManagementClient users={users} />
    </div>
  );
}


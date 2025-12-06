import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import CreateStaffClient from './create-staff-client';

async function getStaff() {
  try {
    const [staff] = await pool.execute(
      'SELECT * FROM staff ORDER BY created_at DESC'
    );
    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

export default async function CreateStaffPage() {
  const session = await getSession();

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  const staff = await getStaff();

  return <CreateStaffClient initialStaff={staff} />;
}


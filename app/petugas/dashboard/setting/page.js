import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Setting from '@/components/staff/Setting';

export default async function SettingPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  return <Setting />;
}


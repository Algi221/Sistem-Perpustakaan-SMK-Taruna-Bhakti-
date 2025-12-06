import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StaffDashboardLayoutClient from './layout-client';

export default async function StaffDashboardLayout({ children }) {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  return <StaffDashboardLayoutClient>{children}</StaffDashboardLayoutClient>;
}


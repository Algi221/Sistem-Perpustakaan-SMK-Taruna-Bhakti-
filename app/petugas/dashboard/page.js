import { redirect } from 'next/navigation';

export default async function StaffDashboardPage() {
  // Redirect to kelola-buku as default page
  redirect('/petugas/dashboard/kelola-buku');
}


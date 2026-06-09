import { redirect } from 'next/navigation';
import { getSession } from '@/server/session';
import AdminDashboard from '@/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const s = await getSession();
  if (!s || s.role !== 'ADMIN') redirect('/login');
  return <AdminDashboard />;
}

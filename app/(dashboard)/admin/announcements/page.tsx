import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminAnnouncementsPanel } from '@/components/admin/AdminAnnouncementsPanel';

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">E'lonlar</h1>
        <p className="text-sm text-ink-tertiary">Guruhga muhim xabar joylash</p>
      </div>
      <AdminAnnouncementsPanel />
    </div>
  );
}

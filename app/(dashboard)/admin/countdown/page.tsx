import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminCountdownPanel } from '@/components/admin/AdminCountdownPanel';

export default async function AdminCountdownPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">Countdown sozlamalari</h1>
        <p className="text-sm text-ink-tertiary">Barcha a'zolarga ko'rinadigan "Ayriliq vaqti" hisoblagichi</p>
      </div>
      <AdminCountdownPanel />
    </div>
  );
}

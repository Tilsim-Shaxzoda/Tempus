import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">A'zolarni boshqarish</h1>
        <p className="text-sm text-ink-tertiary">Ochiq ro'yxatdan o'tish yo'q — faqat siz a'zo qo'shasiz</p>
      </div>
      <AdminUsersPanel />
    </div>
  );
}

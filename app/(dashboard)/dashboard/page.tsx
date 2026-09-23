import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { CountdownCard } from '@/components/dashboard/CountdownCard';
import { ContactsList } from '@/components/dashboard/ContactsList';
import { GlassCard } from '@/components/ui/GlassCard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">
          Xush kelibsiz, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-ink-tertiary">Guruhingizning bugungi holati</p>
      </div>

      <CountdownCard />

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-primary">Kontaktlar</p>
            <Link href="/contacts" className="text-xs text-accent hover:underline">
              Barchasi
            </Link>
          </div>
          <ContactsList limit={4} />
        </GlassCard>

        <GlassCard className="p-5">
          <p className="mb-4 text-sm font-medium text-ink-primary">Tezkor havolalar</p>
          <div className="space-y-2">
            <Link
              href="/chat"
              className="block rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-ink-secondary hover:bg-white/[0.04]"
            >
              Umumiy chatga o'tish
            </Link>
            <Link
              href="/birthdays"
              className="block rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-ink-secondary hover:bg-white/[0.04]"
            >
              Tug'ilgan kunlarni ko'rish
            </Link>
            <Link
              href="/profile"
              className="block rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-ink-secondary hover:bg-white/[0.04]"
            >
              Profilni tahrirlash
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

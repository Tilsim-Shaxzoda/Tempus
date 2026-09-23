import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Timer, Megaphone } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { GlassCard } from '@/components/ui/GlassCard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== 'ADMIN') redirect('/dashboard');

  const cards = [
    { href: '/admin/users', title: 'A\'zolar', desc: 'Yangi a\'zo qo\'shish, bloklash, parolni tiklash', icon: Users },
    { href: '/admin/countdown', title: 'Countdown', desc: 'Ayriliq vaqti sanasini sozlash', icon: Timer },
    { href: '/admin/announcements', title: 'E\'lonlar', desc: 'Guruhga e\'lon joylash', icon: Megaphone }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">Admin panel</h1>
        <p className="text-sm text-ink-tertiary">Guruhni boshqarish</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <GlassCard className="h-full p-5 transition hover:bg-white/[0.05]">
              <Icon className="mb-3 h-5 w-5 text-accent" strokeWidth={1.75} />
              <p className="text-sm font-medium text-ink-primary">{title}</p>
              <p className="mt-1 text-xs text-ink-tertiary">{desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

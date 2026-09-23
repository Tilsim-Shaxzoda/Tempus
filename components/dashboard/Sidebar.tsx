'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Home,
  MessageCircle,
  Users,
  Cake,
  User,
  Settings,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/contacts', label: 'Kontaktlar', icon: Users },
  { href: '/birthdays', label: 'Tug\'ilgan kunlar', icon: Cake },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/settings', label: 'Sozlamalar', icon: Settings }
];

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.02] px-3 py-6 backdrop-blur-xl sm:flex">
      <div className="mb-8 px-3">
        <p className="text-sm font-semibold tracking-tight text-ink-primary">Ayriliq Vaqti</p>
        <p className="text-[11px] text-ink-tertiary">private group</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                active
                  ? 'bg-white/[0.06] text-ink-primary'
                  : 'text-ink-secondary hover:bg-white/[0.03] hover:text-ink-primary'
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-white/[0.06]" />
            <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-ink-tertiary">
              Admin
            </p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                pathname.startsWith('/admin')
                  ? 'bg-white/[0.06] text-ink-primary'
                  : 'text-ink-secondary hover:bg-white/[0.03] hover:text-ink-primary'
              )}
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              Admin panel
            </Link>
          </>
        )}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-secondary transition hover:bg-white/[0.03] hover:text-ink-primary"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        Chiqish
      </button>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Users, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: '/dashboard', label: 'Bosh', icon: Home },
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/contacts', label: 'Kontakt', icon: Users },
    { href: '/profile', label: 'Profil', icon: User },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }] : [])
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-white/[0.06] bg-base-950/90 px-2 py-2 backdrop-blur-xl sm:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px]',
              active ? 'text-accent' : 'text-ink-tertiary'
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import { useMemo } from 'react';
import { Cake } from 'lucide-react';
import type { Contact } from '@/lib/storage';
import { getUpcomingBirthdays } from '@/utils/birthdays';
import { GlassCard } from '@/components/ui/GlassCard';

export function BirthdaysList({ contacts }: { contacts: Contact[] }) {
  const upcoming = useMemo(() => getUpcomingBirthdays(contacts), [contacts]);

  if (upcoming.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-sm text-ink-tertiary">
        Hech kimning tug'ilgan kuni kiritilmagan.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-2">
      {upcoming.map(({ contact, daysUntil, turningAge }) => (
        <GlassCard key={contact.id} className="flex items-center gap-4 px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Cake className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-primary">{contact.fullName}</p>
            <p className="text-xs text-ink-tertiary">
              {turningAge != null ? `${turningAge} yoshga to'ladi` : 'Tug\'ilgan kun'}
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-accent">
            {daysUntil === 0 ? 'Bugun!' : daysUntil === 1 ? 'Ertaga' : `${daysUntil} kundan keyin`}
          </span>
        </GlassCard>
      ))}
    </div>
  );
}

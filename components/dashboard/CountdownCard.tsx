'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CountdownDigit } from './CountdownDigit';
import { computeCountdown } from '@/utils/countdown';
import type { CountdownData } from '@/lib/storage';

export function CountdownCard({ countdown }: { countdown: CountdownData | null }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!countdown) {
    return (
      <GlassCard className="flex h-40 items-center justify-center px-6 text-center">
        <span className="text-sm text-ink-tertiary">
          Countdown hali sozlanmagan. Admin panel orqali qo‘shing.
        </span>
      </GlassCard>
    );
  }

  const parts = computeCountdown(new Date(countdown.startAt), new Date(countdown.targetAt), now);

  return (
    <GlassCard className="relative overflow-hidden px-4 py-8 sm:px-10 sm:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-accent-glow blur-3xl"
      />

      <p className="relative mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-ink-secondary sm:mb-8">
        {countdown.title}
      </p>

      <div className="relative flex items-center justify-center divide-x divide-white/[0.06]">
        <CountdownDigit value={parts.days} label="KUN" />
        <CountdownDigit value={parts.hours} label="SOAT" />
        <CountdownDigit value={parts.minutes} label="DAQIQA" />
        <CountdownDigit value={parts.seconds} label="SONIYA" />
      </div>

      <div className="relative mx-auto mt-8 max-w-md" role="progressbar" aria-valuenow={parts.percentElapsed} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
            style={{ width: `${Math.min(parts.percentElapsed, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ink-tertiary">
          <span>START</span>
          <span>{parts.isFinished ? 'YAKUNLANDI' : 'END'}</span>
        </div>
      </div>
    </GlassCard>
  );
}

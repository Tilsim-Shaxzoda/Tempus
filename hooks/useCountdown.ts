'use client';

import { useEffect, useRef, useState } from 'react';
import { computeCountdown, type CountdownParts } from '@/utils/countdown';

interface CountdownData {
  id: string;
  title: string;
  startAt: string;
  targetAt: string;
}

export function useCountdown() {
  const [data, setData] = useState<CountdownData | null>(null);
  const [parts, setParts] = useState<CountdownParts | null>(null);
  const [loading, setLoading] = useState(true);
  const offsetRef = useRef(0); // serverNow - Date.now(), captured once per fetch

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/countdown', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;

        if (json.countdown) {
          offsetRef.current = new Date(json.serverNow).getTime() - Date.now();
          setData(json.countdown);
        } else {
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const resync = setInterval(load, 5 * 60 * 1000); // re-sync clock every 5 min
    return () => {
      cancelled = true;
      clearInterval(resync);
    };
  }, []);

  useEffect(() => {
    if (!data) {
      setParts(null);
      return;
    }

    function tick() {
      if (!data) return;
      const trustedNow = new Date(Date.now() + offsetRef.current);
      setParts(computeCountdown(new Date(data.startAt), new Date(data.targetAt), trustedNow));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data]);

  return { title: data?.title ?? 'AYRILIQ VAQTI', parts, loading, hasCountdown: !!data };
}

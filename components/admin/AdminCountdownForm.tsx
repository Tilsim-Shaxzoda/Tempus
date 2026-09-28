'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAppData } from '@/hooks/useAppData';

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary focus:border-accent/40';

function toLocalInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminCountdownForm() {
  const { countdown, setCountdown } = useAppData();
  const [title, setTitle] = useState('AYRILIQ VAQTI');
  const [startAt, setStartAt] = useState('');
  const [targetAt, setTargetAt] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (countdown) {
      setTitle(countdown.title);
      setStartAt(toLocalInput(countdown.startAt));
      setTargetAt(toLocalInput(countdown.targetAt));
    }
  }, [countdown]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!startAt || !targetAt) return;
    setCountdown({
      title: title.trim() || 'AYRILIQ VAQTI',
      startAt: new Date(startAt).toISOString(),
      targetAt: new Date(targetAt).toISOString()
    });
    setMessage('Countdown yangilandi');
    setTimeout(() => setMessage(null), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Sarlavha</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} maxLength={60} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Boshlanish vaqti</span>
        <input
          type="datetime-local"
          required
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Maqsad vaqti</span>
        <input
          type="datetime-local"
          required
          value={targetAt}
          onChange={(e) => setTargetAt(e.target.value)}
          className={inputClass}
        />
      </label>

      {message && <p className="text-xs text-accent">{message}</p>}

      <button
        type="submit"
        className="rounded-lg bg-accent/90 px-4 py-2.5 text-sm font-medium text-base-950 hover:bg-accent"
      >
        Saqlash
      </button>
    </form>
  );
}

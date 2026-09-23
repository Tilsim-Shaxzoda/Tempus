'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary focus:border-accent/40';

function toLocalInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminCountdownPanel() {
  const [title, setTitle] = useState('AYRILIQ VAQTI');
  const [startAt, setStartAt] = useState('');
  const [targetAt, setTargetAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/countdown')
      .then((r) => r.json())
      .then((json) => {
        if (json.countdown) {
          setTitle(json.countdown.title);
          setStartAt(toLocalInput(json.countdown.startAt));
          setTargetAt(toLocalInput(json.countdown.targetAt));
        }
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch('/api/admin/countdown', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        startAt: new Date(startAt).toISOString(),
        targetAt: new Date(targetAt).toISOString()
      })
    });

    setSaving(false);
    const json = await res.json();

    if (!res.ok) {
      setMessage({ type: 'error', text: typeof json.error === 'string' ? json.error : 'Xatolik yuz berdi' });
      return;
    }
    setMessage({ type: 'ok', text: 'Countdown yangilandi' });
  }

  return (
    <GlassCard className="max-w-md p-5">
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

        {message && (
          <p className={`text-xs ${message.type === 'ok' ? 'text-accent' : 'text-red-400'}`}>{message.text}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent/90 px-4 py-2.5 text-sm font-medium text-base-950 hover:bg-accent disabled:opacity-50"
        >
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>
    </GlassCard>
  );
}

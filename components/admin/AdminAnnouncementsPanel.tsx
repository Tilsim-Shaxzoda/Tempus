'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  createdBy: { fullName: string };
}

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-accent/40';

export function AdminAnnouncementsPanel() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/announcements');
    const json = await res.json();
    setItems(json.announcements ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPosting(true);
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    setPosting(false);
    setTitle('');
    setBody('');
    load();
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Sarlavha"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
          <textarea
            required
            placeholder="Matn"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${inputClass} resize-none`}
          />
          <button
            type="submit"
            disabled={posting}
            className="rounded-lg bg-accent/90 px-4 py-2.5 text-sm font-medium text-base-950 hover:bg-accent disabled:opacity-50"
          >
            {posting ? 'Joylanmoqda...' : 'E\'lon qilish'}
          </button>
        </form>
      </GlassCard>

      <div className="space-y-2">
        {items.map((a) => (
          <GlassCard key={a.id} className="p-4">
            <p className="text-sm font-medium text-ink-primary">{a.title}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-secondary">{a.body}</p>
            <p className="mt-2 text-[11px] text-ink-tertiary">
              {a.createdBy.fullName} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

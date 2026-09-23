'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { UserPlus, Lock, Ban, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'MEMBER';
  isBlocked: boolean;
  isOnline: boolean;
}

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-accent/40';

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'MEMBER' as const });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const json = await res.json();
    setUsers(json.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const json = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(typeof json.error === 'string' ? json.error : 'Xatolik yuz berdi');
      return;
    }

    setForm({ username: '', password: '', fullName: '', role: 'MEMBER' });
    load();
  }

  async function toggleBlock(user: AdminUser) {
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !user.isBlocked })
    });
    load();
  }

  async function resetPassword(user: AdminUser) {
    const newPassword = prompt(`${user.fullName} uchun yangi parol (kamida 8 belgi):`);
    if (!newPassword) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error ?? 'Xatolik');
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-ink-primary">
          <UserPlus className="h-4 w-4" /> Yangi a'zo qo'shish
        </p>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="To'liq ism"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
          />
          <input
            required
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="password"
            placeholder="Parol (kamida 8 belgi)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as 'MEMBER' })}
            className={inputClass}
          >
            <option value="MEMBER">A'zo</option>
            <option value="ADMIN">Admin</option>
          </select>
          {error && <p className="text-xs text-red-400 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-accent/90 px-4 py-2.5 text-sm font-medium text-base-950 hover:bg-accent disabled:opacity-50 sm:col-span-2"
          >
            {creating ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
          </button>
        </form>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="mb-4 text-sm font-medium text-ink-primary">A'zolar ({users.length})</p>
        {loading ? (
          <p className="text-sm text-ink-tertiary">Yuklanmoqda...</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-primary">
                    {user.fullName} <span className="text-ink-tertiary">@{user.username}</span>
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    {user.role === 'ADMIN' ? 'Admin' : 'A\'zo'} · {user.isOnline ? 'online' : 'offline'}
                    {user.isBlocked && <span className="text-red-400"> · bloklangan</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => resetPassword(user)}
                    aria-label="Parolni tiklash"
                    className="rounded-md p-2 text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
                  >
                    <Lock className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => toggleBlock(user)}
                    aria-label={user.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
                    className="rounded-md p-2 text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
                  >
                    {user.isBlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <Ban className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

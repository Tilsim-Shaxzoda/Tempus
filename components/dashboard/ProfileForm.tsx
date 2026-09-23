'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-accent/40';

interface ProfileData {
  fullName: string;
  username: string;
  phone: string | null;
  telegram: string | null;
  bio: string | null;
  birthday: string | null;
}

export function ProfileForm() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((json) => setProfile(json.user));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: profile.fullName,
        phone: profile.phone,
        telegram: profile.telegram,
        bio: profile.bio,
        birthday: profile.birthday ? new Date(profile.birthday).toISOString() : null,
        ...(newPassword ? { currentPassword, newPassword } : {})
      })
    });

    setSaving(false);
    const json = await res.json();

    if (!res.ok) {
      setMessage({ type: 'error', text: json.error?.toString?.() ?? 'Xatolik yuz berdi' });
      return;
    }

    setMessage({ type: 'ok', text: 'Saqlandi' });
    setCurrentPassword('');
    setNewPassword('');
  }

  if (!profile) {
    return <p className="text-sm text-ink-tertiary">Yuklanmoqda...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard className="space-y-4 p-5">
        <p className="text-sm font-medium text-ink-primary">Shaxsiy ma'lumotlar</p>

        <Field label="To'liq ism">
          <input
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="Username">
          <input value={profile.username} disabled className={`${inputClass} opacity-50`} />
        </Field>

        <Field label="Telefon">
          <input
            value={profile.phone ?? ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value || null })}
            className={inputClass}
            placeholder="+998..."
          />
        </Field>

        <Field label="Telegram">
          <input
            value={profile.telegram ?? ''}
            onChange={(e) => setProfile({ ...profile, telegram: e.target.value || null })}
            className={inputClass}
            placeholder="@username"
          />
        </Field>

        <Field label="Tug'ilgan kun">
          <input
            type="date"
            value={profile.birthday ? profile.birthday.slice(0, 10) : ''}
            onChange={(e) => setProfile({ ...profile, birthday: e.target.value || null })}
            className={inputClass}
          />
        </Field>

        <Field label="Bio">
          <textarea
            value={profile.bio ?? ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value || null })}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </GlassCard>

      <GlassCard className="space-y-4 p-5">
        <p className="text-sm font-medium text-ink-primary">Parolni o'zgartirish</p>
        <Field label="Joriy parol">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Yangi parol">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="Kamida 8 belgi"
          />
        </Field>
      </GlassCard>

      {message && (
        <p className={`text-xs ${message.type === 'ok' ? 'text-accent' : 'text-red-400'}`}>{message.text}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent/90 px-5 py-2.5 text-sm font-medium text-base-950 transition hover:bg-accent disabled:opacity-50"
      >
        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}

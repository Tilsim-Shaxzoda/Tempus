'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === 'BLOCKED'
          ? 'Sizning hisobingiz bloklangan. Admin bilan bog\'laning.'
          : 'Username yoki parol noto\'g\'ri.'
      );
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <GlassCard className="w-full max-w-sm p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
          <Lock className="h-4 w-4 text-accent" strokeWidth={1.75} />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-ink-primary">Ayriliq Vaqti</h1>
        <p className="mt-1 text-sm text-ink-tertiary">Yopiq guruh a'zolari uchun</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-ink-secondary">
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-accent/40"
            placeholder="username"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink-secondary">
            Parol
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 pr-10 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-accent/40"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent/90 px-4 py-2.5 text-sm font-medium text-base-950 transition hover:bg-accent disabled:opacity-50"
        >
          {loading ? 'Tekshirilmoqda...' : 'KIRISH'}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] text-ink-tertiary">
        Hisobingiz yo'qmi? Faqat admin yangi a'zo qo'sha oladi.
      </p>
    </GlassCard>
  );
}

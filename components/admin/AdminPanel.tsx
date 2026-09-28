'use client';

import { useState, type FormEvent } from 'react';
import { Settings, X, LogOut } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ADMIN_CODE, isAdminAuthed, setAdminAuthed } from '@/lib/storage';
import { AdminCountdownForm } from './AdminCountdownForm';
import { AdminContactsManager } from './AdminContactsManager';

export function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setAuthed(isAdminAuthed());
    setCode('');
    setError(null);
    setOpen(true);
  }

  function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setAdminAuthed(true);
      setAuthed(true);
      setError(null);
    } else {
      setError("Kod noto'g'ri");
    }
  }

  function handleLogout() {
    setAdminAuthed(false);
    setAuthed(false);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-white/[0.08] bg-base-900/90 px-4 py-2.5 text-xs font-medium text-ink-secondary shadow-glass backdrop-blur-xl hover:text-ink-primary sm:bottom-6 sm:right-6"
      >
        <Settings className="h-4 w-4" strokeWidth={1.75} />
        Admin panel
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <GlassCard
            className="max-h-[85vh] w-full max-w-md overflow-y-auto scroll-thin p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-primary">Admin panel</h2>
              <div className="flex items-center gap-1">
                {authed && (
                  <button
                    onClick={handleLogout}
                    aria-label="Chiqish"
                    className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Yopish"
                  className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {!authed ? (
              <form onSubmit={handleCodeSubmit} className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Kod</span>
                  <input
                    type="password"
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary focus:border-accent/40"
                  />
                </label>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  className="rounded-lg bg-accent/90 px-4 py-2.5 text-sm font-medium text-base-950 hover:bg-accent"
                >
                  Kirish
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-tertiary">Countdown</h3>
                  <AdminCountdownForm />
                </section>
                <section className="border-t border-white/[0.06] pt-5">
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-tertiary">Kontaktlar</h3>
                  <AdminContactsManager />
                </section>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </>
  );
}

'use client';

import { useAppData } from '@/hooks/useAppData';
import { CountdownCard } from '@/components/dashboard/CountdownCard';
import { ContactsList } from '@/components/dashboard/ContactsList';
import { BirthdaysList } from '@/components/dashboard/BirthdaysList';
import { AdminPanel } from '@/components/admin/AdminPanel';

export default function HomePage() {
  const { loading, configured, error, countdown, contacts } = useAppData();

  if (!configured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-medium text-ink-primary">Firebase hali sozlanmagan</p>
          <p className="text-xs text-ink-tertiary">
            Ma&apos;lumotlar hammaga umumiy ko&apos;rinishi uchun{' '}
            <code className="text-ink-secondary">lib/firebase.ts</code> faylida o&apos;z Firebase
            loyihangiz sozlamalarini kiriting (README.md dagi yo&apos;riqnomaga qarang).
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-ink-tertiary">Yuklanmoqda...</span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="max-w-sm text-sm text-ink-tertiary">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-8 sm:px-6 sm:pb-16 sm:pt-16">
      <h1 className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-ink-tertiary sm:mb-8 sm:text-sm sm:tracking-[0.3em]">
        Ayriliq vaqti
      </h1>

      <CountdownCard countdown={countdown} />

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-ink-primary">Kontaktlar</h2>
        <ContactsList contacts={contacts} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-ink-primary">Tug'ilgan kunlar</h2>
        <BirthdaysList contacts={contacts} />
      </section>

      <AdminPanel />
    </main>
  );
}

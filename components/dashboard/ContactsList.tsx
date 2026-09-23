'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { ContactCard } from './ContactCard';

export function ContactsList({ limit }: { limit?: number }) {
  const { contacts, loading } = useContacts();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? contacts
      : contacts.filter(
          (c) => c.fullName.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
        );
    return limit ? base.slice(0, limit) : base;
  }, [contacts, query, limit]);

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Do'stni qidirish..."
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 pl-9 pr-3 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-accent/40"
        />
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-ink-tertiary">Yuklanmoqda...</p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-tertiary">Hech kim topilmadi.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}

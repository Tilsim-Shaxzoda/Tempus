'use client';

import { useEffect, useState } from 'react';

export interface Contact {
  id: string;
  fullName: string;
  username: string;
  phone: string | null;
  telegram: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: string;
  birthday: string | null;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setContacts(json.contacts ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { contacts, loading };
}

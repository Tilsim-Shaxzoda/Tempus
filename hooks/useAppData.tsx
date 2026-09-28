'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadData, saveData, type AppData, type Contact, type CountdownData } from '@/lib/storage';

interface AppDataContextValue {
  loading: boolean;
  countdown: CountdownData | null;
  contacts: Contact[];
  setCountdown: (countdown: CountdownData | null) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, patch: Partial<Omit<Contact, 'id'>>) => void;
  removeContact: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({ countdown: null, contacts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(loadData());
    setLoading(false);
  }, []);

  function persist(next: AppData) {
    setData(next);
    saveData(next);
  }

  const value: AppDataContextValue = {
    loading,
    countdown: data.countdown,
    contacts: data.contacts,
    setCountdown: (countdown) => persist({ ...data, countdown }),
    addContact: (contact) =>
      persist({
        ...data,
        contacts: [...data.contacts, { ...contact, id: crypto.randomUUID() }]
      }),
    updateContact: (id, patch) =>
      persist({
        ...data,
        contacts: data.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c))
      }),
    removeContact: (id) =>
      persist({ ...data, contacts: data.contacts.filter((c) => c.id !== id) })
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

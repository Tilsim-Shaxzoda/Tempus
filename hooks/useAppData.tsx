'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { ADMIN_CODE, defaultData, type AppData, type Contact, type CountdownData } from '@/lib/storage';

interface AppDataContextValue {
  loading: boolean;
  configured: boolean;
  error: string | null;
  countdown: CountdownData | null;
  contacts: Contact[];
  setCountdown: (countdown: CountdownData | null) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, patch: Partial<Omit<Contact, 'id'>>) => void;
  removeContact: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    const ref = doc(db, 'app', 'main');
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const raw = snapshot.data();
        setData({
          countdown: (raw?.countdown as CountdownData | undefined) ?? null,
          contacts: Array.isArray(raw?.contacts) ? (raw!.contacts as Contact[]) : []
        });
        setError(null);
        setLoading(false);
      },
      () => {
        setError("Ma'lumotni yuklab bo'lmadi. Firebase/Firestore sozlamalarini tekshiring.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  async function persist(next: AppData) {
    setData(next);
    if (!isFirebaseConfigured || !db) return;
    try {
      await setDoc(doc(db, 'app', 'main'), { ...next, adminCode: ADMIN_CODE });
    } catch {
      setError("Saqlab bo'lmadi. Internet aloqasi yoki Firestore qoidalarini tekshiring.");
    }
  }

  const value: AppDataContextValue = {
    loading,
    configured: isFirebaseConfigured,
    error,
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

export interface Contact {
  id: string;
  fullName: string;
  phone: string | null;
  telegram: string | null;
  birthday: string | null;
}

export interface CountdownData {
  title: string;
  startAt: string;
  targetAt: string;
}

export interface AppData {
  countdown: CountdownData | null;
  contacts: Contact[];
}

const STORAGE_KEY = 'ayriliq-vaqti:data';

// Static site, no backend/env available — admin gate is just this shared code.
export const ADMIN_CODE = 'admin123';
const ADMIN_SESSION_KEY = 'ayriliq-vaqti:admin';

const defaultData: AppData = {
  countdown: null,
  contacts: []
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return {
      countdown: parsed.countdown ?? null,
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : []
    };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isAdminAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

export function setAdminAuthed(authed: boolean) {
  if (typeof window === 'undefined') return;
  if (authed) {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
  } else {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

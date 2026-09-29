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

// Barcha tashrif buyuruvchilar buni ko'radi — Firestore xavfsizlik qoidalarida ham
// yozish shu kodni talab qiladi (README.md dagi qoidalar namunasiga qarang).
export const ADMIN_CODE = 'admin123';
const ADMIN_SESSION_KEY = 'ayriliq-vaqti:admin';

export const defaultData: AppData = {
  countdown: null,
  contacts: []
};

// Bu faqat "admin kodi shu brauzerda tasdiqlandimi" degan vaqtinchalik UI holati —
// umumiy ma'lumot emas, shuning uchun sessionStorage'da qolaveradi.
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

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase Console → Project settings → General → "Your apps" → SDK config
// shu yerdan nusxalab, quyidagi qiymatlarni o'zingiznikiga almashtiring.
// (README.md dagi "Umumiy ma'lumot saqlash (Firebase)" bo'limida qadam-baqadam yo'riqnoma bor.)
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';

const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

export const db = app ? getFirestore(app) : null;

# Ayriliq Vaqti

Oddiy statik sayt: countdown ("ayriliq vaqti"), kontaktlar va tug'ilgan kunlar.
Backend yo'q, login yo'q — lekin ma'lumot Firebase Firestore'da (bepul) saqlanadi,
shuning uchun admin nima kiritsa, saytga kirgan **hamma** shuni ko'radi.

## Texnologiyalar

- Next.js 14 (App Router, static export) + TypeScript
- Tailwind CSS
- Ma'lumot: Firebase Firestore (bepul reja, server yozish shart emas)

## O'rnatish va ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:3000` da ochiladi. Ishlashi uchun avval pastdagi
**Firebase sozlash** bo'limini bajarish kerak — aks holda sahifa
"Firebase hali sozlanmagan" deb ko'rsatadi.

## Firebase sozlash (umumiy ma'lumot saqlash uchun)

Ma'lumot barcha tashrif buyuruvchilarga bir xil ko'rinishi uchun bitta bepul
Firebase loyihasi kerak. Bir marta sozlaysiz, keyin hech qachon qayta qilish
shart emas.

1. https://console.firebase.google.com ga kiring (Google hisobingiz bilan)
2. **Add project** → nom bering (masalan `ayriliq-vaqti`) → davom eting
   (Google Analytics so'ralsa, kerak emas, o'chirib qo'yavering)
3. Chap menyudan **Build → Firestore Database** → **Create database**
   - Joylashuv (location) — istalgani, masalan `eur3 (europe-west)`
   - Rejim: **Start in production mode** ni tanlang (keyin pastda qoidani
     o'zimiz qo'yamiz)
4. Firestore ochilgach, **Rules** tab'iga o'ting va quyidagini joylashtirib,
   **Publish** bosing:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /app/{docId} {
         allow read: if true;
         allow write: if request.resource.data.adminCode == "admin123";
       }
     }
   }
   ```

   (`admin123` — bu [lib/storage.ts](lib/storage.ts) dagi `ADMIN_CODE` bilan
   bir xil bo'lishi shart. O'sha yerda kodni o'zgartirsangiz, shu yerda ham
   xuddi shunday o'zgartiring.)

5. Loyiha sozlamalariga qayting: chap yuqoridagi ⚙️ **Project settings**
6. Pastda **Your apps** → **</>** (Web) belgisini bosing → nom bering
   (masalan `web`) → **Register app**
7. Sizga `firebaseConfig` degan JavaScript obyekti ko'rsatiladi — shu
   qiymatlarni nusxalab, [lib/firebase.ts](lib/firebase.ts) faylidagi
   `firebaseConfig` ichiga joylashtiring (har bir maydonni almashtiring:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`,
   `messagingSenderId`, `appId`)
8. Faylni saqlang, `npm run dev` bilan tekshiring — "Firebase hali
   sozlanmagan" xabari yo'qolishi kerak

Shu qadamlardan so'ng kodni GitHub'ga push qilsangiz, Render'dagi build ham
xuddi shu sozlamalar bilan ishlaydi (alohida environment variable kerak emas,
qiymatlar to'g'ridan-to'g'ri kod ichida).

## Build (statik fayllar)

```bash
npm run build
```

Statik sayt `out/` papkasida hosil bo'ladi.

## Render.com'ga deploy qilish (Static Site)

1. Render'da yangi **Static Site** yarating, shu GitHub repoga ulang.
2. Build command: `npm install && npm run build`
3. Publish directory: `out`

Boshqa hech qanday sozlama (environment variable, baza) shart emas — Firebase
sozlamalari kod ichida.

## Admin panel

Sahifaning pastki o'ng burchagida "Admin panel" tugmasi bor. Bosilganda kod
so'raladi (standart kod: `admin123`, [lib/storage.ts](lib/storage.ts) faylida
`ADMIN_CODE` sifatida saqlangan — o'zgartirmoqchi bo'lsangiz shu faylni **va**
Firestore Rules'dagi qiymatni birga o'zgartiring). Kod to'g'ri kiritilgach:

- Countdown sarlavhasi, boshlanish va maqsad vaqtini sozlash
- Kontakt qo'shish, tahrirlash, o'chirish (ism, telefon, telegram, tug'ilgan kun)

Barcha o'zgarishlar Firestore'ga yoziladi va saytga kirgan hamma darhol (sahifani
yangilamasdan) shu o'zgarishni ko'radi.

**Xavfsizlik haqida eslatma:** bu chinakam autentifikatsiya emas — kod ham,
Firestore qoidasi ham ochiq manba (GitHub'da) ko'rinadi. Maqsad — tasodifiy
odam yozolmasligi, texnik jihatdan qat'iy himoya emas.

## Loyiha tuzilishi

```
app/
  layout.tsx        # umumiy layout, shrift va AppDataProvider
  page.tsx           # yagona sahifa: countdown + kontaktlar + tug'ilgan kunlar
components/
  ui/                 # GlassCard
  dashboard/          # CountdownCard, ContactsList, BirthdaysList, ...
  admin/               # Admin panel (kod bilan kirish, countdown va kontakt formalari)
hooks/useAppData.tsx   # Firestore bilan ishlaydigan data context (realtime)
lib/firebase.ts         # Firebase loyiha sozlamalari (o'zingiznikini shu yerga qo'yasiz)
lib/storage.ts          # tiplar, admin kodi, admin sessiya holati
utils/                   # countdown va tug'ilgan kun hisob-kitoblari
```

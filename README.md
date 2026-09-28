# Ayriliq Vaqti

Oddiy statik sayt: countdown ("ayriliq vaqti"), kontaktlar va tug'ilgan kunlar.
Backend, baza yoki login yo'q — barcha ma'lumot brauzerning localStorage'ida saqlanadi.

## Texnologiyalar

- Next.js 14 (App Router, static export) + TypeScript
- Tailwind CSS
- Ma'lumot: brauzer localStorage (server/baza yo'q)

## O'rnatish va ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:3000` da ochiladi.

## Build (statik fayllar)

```bash
npm run build
```

Statik sayt `out/` papkasida hosil bo'ladi.

## Render.com'ga deploy qilish (Static Site)

1. Render'da yangi **Static Site** yarating, shu GitHub repoga ulang.
2. Build command: `npm install && npm run build`
3. Publish directory: `out`

Boshqa hech qanday sozlama (environment variable, baza) shart emas.

## Admin panel

Sahifaning pastki o'ng burchagida "Admin panel" tugmasi bor. Bosilganda kod
so'raladi (standart kod: `admin123`, [lib/storage.ts](lib/storage.ts) faylida
`ADMIN_CODE` sifatida saqlangan — o'zgartirmoqchi bo'lsangiz shu faylni
tahrirlang). Kod to'g'ri kiritilgach:

- Countdown sarlavhasi, boshlanish va maqsad vaqtini sozlash
- Kontakt qo'shish, tahrirlash, o'chirish (ism, telefon, telegram, tug'ilgan kun)

Barcha o'zgarishlar shu brauzerning localStorage'ida saqlanadi.

## Loyiha tuzilishi

```
app/
  layout.tsx        # umumiy layout, shrift va AppDataProvider
  page.tsx           # yagona sahifa: countdown + kontaktlar + tug'ilgan kunlar
components/
  ui/                 # GlassCard
  dashboard/          # CountdownCard, ContactsList, BirthdaysList, ...
  admin/               # Admin panel (kod bilan kirish, countdown va kontakt formalari)
hooks/useAppData.tsx   # localStorage bilan ishlaydigan data context
lib/storage.ts          # saqlash funksiyalari, tiplar, admin kodi
utils/                   # countdown va tug'ilgan kun hisob-kitoblari
```

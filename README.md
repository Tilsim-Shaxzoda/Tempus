# Ayriliq Vaqti — Private Group Platform

Yopiq (invite-only) do'stlar guruhi uchun platforma: real-time chat, kontaktlar,
countdown ("Ayriliq vaqti"), tug'ilgan kunlar, profil va admin panel.

Dizayn: dark mode, matte black, glassmorphism, bitta nozik accent rang (emerald).
Ochiq ro'yxatdan o'tish yo'q — faqat admin yangi a'zo yarata oladi.

## Texnologiyalar

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth (Credentials, bcrypt, JWT session)
- Socket.IO (custom server orqali) — real-time chat, typing, online status

## 1. O'rnatish

```bash
npm install
cp .env.example .env
```

`.env` faylida `DATABASE_URL` ni o'zingizning PostgreSQL manzilingizga o'zgartiring
(Render Postgres, Supabase, Neon yoki local Postgres — barchasi ishlaydi).

`NEXTAUTH_SECRET` yarating:

```bash
openssl rand -base64 32
```

## 2. Ma'lumotlar bazasi

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

`db:seed` birinchi admin hisobini yaratadi (`.env` dagi `SEED_ADMIN_*`
qiymatlaridan, yoki default: username `admin`, parol `ChangeMe123!`).
**Birinchi kirishdan so'ng darhol parolni o'zgartiring** (Profil sahifasidan).

## 3. Ishga tushirish (lokal)

```bash
npm run dev
```

`http://localhost:3000` da ochiladi. Custom server (`server.ts`) Next.js va
Socket.IO'ni bitta HTTP serverda birlashtiradi, shu sabab `next dev` emas,
`tsx server.ts` ishlatiladi.

## 4. Render.com'ga deploy qilish

1. Render'da yangi **Web Service** yarating, shu GitHub repoga ulang.
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npm start`
4. Render'da **PostgreSQL** instance yarating va uning connection string'ini
   `DATABASE_URL` environment variable sifatida web service'ga qo'shing.
5. `NEXTAUTH_SECRET` va `NEXTAUTH_URL` (https://sizning-domeningiz.onrender.com)
   ni environment variables'ga qo'shing.
6. Birinchi deploy'dan keyin, Render Shell orqali migratsiya va seed'ni ishga
   tushiring: `npx prisma migrate deploy && npm run db:seed`

Render's free/starter web service'lari uxlab qolishi mumkin — agar chat doim
online bo'lishi kerak bo'lsa, "Always On" yoqilgan reja tanlang, aks holda
Socket.IO ulanishi uyg'onish paytida bir necha soniya kechikishi mumkin.

**Diqqat:** biriktirilgan fayllar (rasm/ovoz/video/fayl) `public/uploads/`ga
lokal diskka saqlanadi. Render'ning oddiy web service diski **vaqtinchalik**
— har bir yangi deploy'da o'chib ketadi. Fayllar doimiy saqlanishi kerak
bo'lsa, Render'da "Persistent Disk" qo'shing (`public/uploads`ga mount qiling)
yoki S3/Cloudinary kabi tashqi storage integratsiyasiga o'ting.

## Loyiha tuzilishi

```
app/
  (dashboard)/        # himoyalangan sahifalar: dashboard, chat, contacts, ...
  api/                # REST route'lar (auth, messages, contacts, admin, ...)
  login/
components/
  ui/                 # GlassCard va boshqa umumiy primitivlar
  dashboard/          # Sidebar, Countdown, ContactsList, ProfileForm
  chat/               # ChatWindow, MessageBubble, MessageComposer
  admin/              # Admin panel komponentlari
lib/                  # prisma client, auth config, password hashing
hooks/                # useChat, useSocket, useCountdown, useContacts
prisma/schema.prisma  # to'liq data model
server.ts             # Next.js + Socket.IO custom server
```

## Hozircha tayyor bo'lgan funksiyalar

- Admin tomonidan yaratilgan hisoblar bilan kirish (ochiq registratsiya yo'q)
- Real-time umumiy chat: yuborish, tahrirlash, o'chirish, reply, pin (admin),
  typing indicator, online/offline holat
- Rasm, fayl, ovozli xabar va dumaloq video-xabar yuborish, stikerlar
  (biriktirilgan fayllar `public/uploads/` papkasida lokal saqlanadi)
- Server vaqtiga bog'langan, animatsiyali "Ayriliq vaqti" countdown
- Kontaktlar ro'yxati (qidiruv, qo'ng'iroq/nusxalash/Telegram)
- Tug'ilgan kunlar ro'yxati (eng yaqinidan tartiblangan)
- Profil tahrirlash, parol almashtirish
- Admin panel: a'zo qo'shish/bloklash/parol tiklash, countdown sozlash, e'lonlar

## Keyingi bosqich uchun qolgan ishlar (spec'da bor, hali qo'shilmagan)

- Emoji reaksiyalar UI'si (`MessageReaction` modeli tayyor)
- "O'qildi" belgisi UI'si (`MessageRead` modeli tayyor)
- Xabarlarni cheksiz scroll bilan sahifalash (API cursor pagination'ni
  qo'llab-quvvatlaydi, frontend hali faqat birinchi sahifani yuklaydi)
- To'liq matn qidiruv UI'si chat ichida (`/api/messages?q=...` tayyor)

Bularni xohlagan tartibda keyingi bosqichda qo'shib boraman — qaysi biridan
boshlashni ayting.

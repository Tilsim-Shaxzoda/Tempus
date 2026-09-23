import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, isPasswordStrongEnough } from '@/lib/password';

const createSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_.]+$/i, 'Faqat harf, raqam, _ va . ruxsat etiladi'),
  password: z.string().min(8),
  fullName: z.string().min(1).max(80),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      isBlocked: true,
      isOnline: true,
      lastSeenAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { username, password, fullName, role } = parsed.data;
  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json({ error: 'Parol kamida 8 belgidan iborat bo\'lishi kerak' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: 'Bu username band' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      username: username.toLowerCase(),
      passwordHash: await hashPassword(password),
      fullName,
      role
    },
    select: { id: true, username: true, fullName: true, role: true }
  });

  return NextResponse.json({ user }, { status: 201 });
}

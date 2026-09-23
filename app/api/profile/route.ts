import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, isPasswordStrongEnough, verifyPassword } from '@/lib/password';

const updateSchema = z.object({
  fullName: z.string().min(1).max(80).optional(),
  phone: z.string().max(30).nullable().optional(),
  telegram: z.string().max(50).nullable().optional(),
  bio: z.string().max(280).nullable().optional(),
  birthday: z.string().datetime().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      fullName: true,
      username: true,
      phone: true,
      telegram: true,
      bio: true,
      birthday: true,
      avatarUrl: true,
      role: true
    }
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { currentPassword, newPassword, birthday, ...rest } = parsed.data;

  const data: Record<string, unknown> = { ...rest };
  if (birthday !== undefined) {
    data.birthday = birthday ? new Date(birthday) : null;
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Joriy parolni kiriting' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Joriy parol noto\'g\'ri' }, { status: 400 });

    if (!isPasswordStrongEnough(newPassword)) {
      return NextResponse.json({ error: 'Yangi parol kamida 8 belgidan iborat bo\'lishi kerak' }, { status: 400 });
    }

    data.passwordHash = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      fullName: true,
      username: true,
      phone: true,
      telegram: true,
      bio: true,
      birthday: true,
      avatarUrl: true,
      role: true
    }
  });

  return NextResponse.json({ user: updated });
}

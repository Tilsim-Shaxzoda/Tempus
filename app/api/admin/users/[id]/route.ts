import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, isPasswordStrongEnough } from '@/lib/password';

const patchSchema = z.object({
  isBlocked: z.boolean().optional(),
  newPassword: z.string().min(8).optional(),
  role: z.enum(['ADMIN', 'MEMBER']).optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: 'O\'zingizni bloklay olmaysiz' }, { status: 400 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { newPassword, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };

  if (newPassword) {
    if (!isPasswordStrongEnough(newPassword)) {
      return NextResponse.json({ error: 'Parol kamida 8 belgidan iborat bo\'lishi kerak' }, { status: 400 });
    }
    data.passwordHash = await hashPassword(newPassword);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, username: true, fullName: true, role: true, isBlocked: true }
  });

  return NextResponse.json({ user });
}

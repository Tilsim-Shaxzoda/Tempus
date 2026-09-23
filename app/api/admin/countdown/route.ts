import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  title: z.string().min(1).max(60),
  startAt: z.string().datetime(),
  targetAt: z.string().datetime()
});

export async function PUT(req: Request) {
  // Middleware already blocks non-admins from /api/admin/*, but the check is
  // repeated here because backend authorization must never depend on middleware alone.
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, startAt, targetAt } = parsed.data;
  if (new Date(targetAt) <= new Date(startAt)) {
    return NextResponse.json({ error: 'Target vaqti start vaqtidan keyin bo\'lishi kerak' }, { status: 400 });
  }

  await prisma.countdown.updateMany({ data: { isActive: false }, where: { isActive: true } });
  const countdown = await prisma.countdown.create({
    data: {
      title,
      startAt: new Date(startAt),
      targetAt: new Date(targetAt),
      isActive: true,
      createdById: session.user.id
    }
  });

  return NextResponse.json({ countdown });
}

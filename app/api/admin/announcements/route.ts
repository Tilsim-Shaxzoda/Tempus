import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(2000)
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { createdBy: { select: { fullName: true } } }
  });

  return NextResponse.json({ announcements });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: { ...parsed.data, createdById: session.user.id }
  });

  return NextResponse.json({ announcement }, { status: 201 });
}

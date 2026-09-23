import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const countdown = await prisma.countdown.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json({
    countdown: countdown
      ? {
          id: countdown.id,
          title: countdown.title,
          startAt: countdown.startAt.toISOString(),
          targetAt: countdown.targetAt.toISOString()
        }
      : null,
    serverNow: new Date().toISOString()
  });
}

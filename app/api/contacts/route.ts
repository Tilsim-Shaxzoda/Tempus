import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contacts = await prisma.user.findMany({
    where: { id: { not: session.user.id }, isBlocked: false },
    select: {
      id: true,
      fullName: true,
      username: true,
      phone: true,
      telegram: true,
      avatarUrl: true,
      isOnline: true,
      lastSeenAt: true,
      birthday: true
    },
    orderBy: { fullName: 'asc' }
  });

  return NextResponse.json({ contacts });
}

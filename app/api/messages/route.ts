import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 30;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const search = searchParams.get('q')?.trim();

  const messages = await prisma.message.findMany({
    where: search ? { content: { contains: search, mode: 'insensitive' } } : undefined,
    take: PAGE_SIZE,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
      replyTo: { select: { id: true, content: true, author: { select: { fullName: true } } } }
    }
  });

  const nextCursor = messages.length === PAGE_SIZE ? messages[messages.length - 1]?.id : null;

  return NextResponse.json({ messages: messages.reverse(), nextCursor });
}

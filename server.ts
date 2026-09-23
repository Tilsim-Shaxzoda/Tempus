import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as IOServer } from 'socket.io';
import { getToken } from 'next-auth/jwt';
import { parse as parseCookie } from 'cookie';
import { prisma } from './lib/prisma';
import { setIO } from './lib/socket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Debounce offline marking so a page refresh / brief network blip doesn't
// flash a user's status to "offline" and back.
const offlineTimers = new Map<string, NodeJS.Timeout>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? '/', true);
    handle(req, res, parsedUrl);
  });

  const io = new IOServer(httpServer, {
    path: '/socket.io'
  });
  setIO(io);

  io.use(async (socket, next_) => {
    try {
      // socket.request is a raw Node IncomingMessage: it only has a `cookie`
      // header string, not the parsed `.cookies` object that next-auth's
      // getToken() relies on to read the session cookie. Without this, every
      // socket connection was silently treated as unauthenticated.
      const cookieHeader = socket.request.headers.cookie ?? '';
      const cookies = parseCookie(cookieHeader);

      const token = await getToken({
        req: { headers: socket.request.headers, cookies } as any,
        secret: process.env.NEXTAUTH_SECRET
      });

      if (!token?.id) {
        return next_(new Error('unauthorized'));
      }

      const user = await prisma.user.findUnique({ where: { id: token.id as string } });
      if (!user || user.isBlocked) {
        return next_(new Error('unauthorized'));
      }

      socket.data.userId = user.id;
      socket.data.username = user.username;
      socket.data.fullName = user.fullName;
      next_();
    } catch (err) {
      next_(new Error('unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const userId: string = socket.data.userId;
    socket.join('main-group');

    const existingTimer = offlineTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      offlineTimers.delete(userId);
    }

    await prisma.user.update({ where: { id: userId }, data: { isOnline: true } });
    io.to('main-group').emit('presence:update', { userId, isOnline: true });

    socket.on(
      'message:send',
      async (payload: {
        content: string;
        replyToId?: string | null;
        attachmentUrl?: string | null;
        attachmentType?: string | null;
        attachmentName?: string | null;
        attachmentSize?: number | null;
        attachmentDuration?: number | null;
      }) => {
        const content = (payload?.content ?? '').trim();
        const attachmentUrl = payload?.attachmentUrl ?? null;
        const isSticker = payload?.attachmentType === 'sticker';
        const hasAttachment = isSticker ? !!content : !!attachmentUrl;
        if ((!content && !hasAttachment) || content.length > 4000) return;
        if (attachmentUrl && !attachmentUrl.startsWith('/uploads/')) return;
        if (!isSticker && !['image', 'file', 'voice', 'video', null, undefined].includes(payload?.attachmentType)) return;

        const message = await prisma.message.create({
          data: {
            content,
            authorId: userId,
            replyToId: payload.replyToId ?? null,
            attachmentUrl: isSticker ? null : attachmentUrl,
            attachmentType: hasAttachment ? payload.attachmentType ?? null : null,
            attachmentName: !isSticker && hasAttachment ? payload.attachmentName ?? null : null,
            attachmentSize: !isSticker && hasAttachment ? payload.attachmentSize ?? null : null,
            attachmentDuration: !isSticker && hasAttachment ? payload.attachmentDuration ?? null : null
          },
          include: {
            author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
            replyTo: { select: { id: true, content: true, author: { select: { fullName: true } } } }
          }
        });

        io.to('main-group').emit('message:new', message);
      }
    );

    socket.on('message:edit', async (payload: { id: string; content: string }) => {
      const existing = await prisma.message.findUnique({ where: { id: payload.id } });
      if (!existing || existing.authorId !== userId || existing.isDeleted) return;

      const content = (payload.content ?? '').trim();
      if (!content) return;

      const updated = await prisma.message.update({
        where: { id: payload.id },
        data: { content, isEdited: true },
        include: {
          author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          replyTo: { select: { id: true, content: true, author: { select: { fullName: true } } } }
        }
      });

      io.to('main-group').emit('message:updated', updated);
    });

    socket.on('message:delete', async (payload: { id: string }) => {
      const existing = await prisma.message.findUnique({ where: { id: payload.id } });
      if (!existing) return;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const canDelete = existing.authorId === userId || user?.role === 'ADMIN';
      if (!canDelete) return;

      const updated = await prisma.message.update({
        where: { id: payload.id },
        data: { isDeleted: true, content: '' },
        include: {
          author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          replyTo: { select: { id: true, content: true, author: { select: { fullName: true } } } }
        }
      });

      io.to('main-group').emit('message:updated', updated);
    });

    socket.on('message:pin', async (payload: { id: string; pinned: boolean }) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') return;

      const updated = await prisma.message.update({
        where: { id: payload.id },
        data: { isPinned: payload.pinned },
        include: {
          author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          replyTo: { select: { id: true, content: true, author: { select: { fullName: true } } } }
        }
      });

      io.to('main-group').emit('message:updated', updated);
    });

    socket.on('typing:start', () => {
      socket.to('main-group').emit('typing:update', { userId, fullName: socket.data.fullName, isTyping: true });
    });

    socket.on('typing:stop', () => {
      socket.to('main-group').emit('typing:update', { userId, fullName: socket.data.fullName, isTyping: false });
    });

    socket.on('disconnect', () => {
      const timer = setTimeout(async () => {
        await prisma.user.update({ where: { id: userId }, data: { isOnline: false, lastSeenAt: new Date() } });
        io.to('main-group').emit('presence:update', { userId, isOnline: false });
        offlineTimers.delete(userId);
      }, 8000);
      offlineTimers.set(userId, timer);
    });
  });

  httpServer.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

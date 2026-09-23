'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from './useSocket';
import type { ChatMessage } from '@/types/chat';

export function useChat() {
  const { data: session } = useSession();
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch('/api/messages')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setMessages(json.messages ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onNew(message: ChatMessage) {
      setMessages((prev) => [...prev, message]);
    }
    function onUpdated(message: ChatMessage) {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)));
    }
    function onTyping({ userId, fullName, isTyping }: { userId: string; fullName: string; isTyping: boolean }) {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = fullName;
        else delete next[userId];
        return next;
      });
    }
    function onPresence({ userId, isOnline }: { userId: string; isOnline: boolean }) {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    }

    socket.on('message:new', onNew);
    socket.on('message:updated', onUpdated);
    socket.on('typing:update', onTyping);
    socket.on('presence:update', onPresence);

    return () => {
      socket.off('message:new', onNew);
      socket.off('message:updated', onUpdated);
      socket.off('typing:update', onTyping);
      socket.off('presence:update', onPresence);
    };
  }, [socket]);

  const sendMessage = useCallback(
    (
      content: string,
      replyToId?: string | null,
      attachment?: {
        url: string;
        type: 'image' | 'file' | 'voice' | 'video' | 'sticker';
        name?: string | null;
        size?: number | null;
        duration?: number | null;
      } | null
    ) => {
      socket.emit('message:send', {
        content,
        replyToId: replyToId ?? null,
        attachmentUrl: attachment?.url ?? null,
        attachmentType: attachment?.type ?? null,
        attachmentName: attachment?.name ?? null,
        attachmentSize: attachment?.size ?? null,
        attachmentDuration: attachment?.duration ?? null
      });
    },
    [socket]
  );

  const editMessage = useCallback(
    (id: string, content: string) => socket.emit('message:edit', { id, content }),
    [socket]
  );

  const deleteMessage = useCallback((id: string) => socket.emit('message:delete', { id }), [socket]);

  const togglePin = useCallback(
    (id: string, pinned: boolean) => socket.emit('message:pin', { id, pinned }),
    [socket]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => socket.emit(isTyping ? 'typing:start' : 'typing:stop'),
    [socket]
  );

  return {
    messages,
    loading,
    typingUsers,
    onlineIds,
    currentUserId: session?.user?.id,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    setTyping
  };
}

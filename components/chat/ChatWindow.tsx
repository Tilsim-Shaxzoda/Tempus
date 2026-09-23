'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import type { ChatMessage } from '@/types/chat';

export function ChatWindow() {
  const { data: session } = useSession();
  const {
    messages,
    loading,
    typingUsers,
    currentUserId,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    setTyping
  } = useChat();
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const isAdmin = session?.user?.role === 'ADMIN';
  const typingNames = Object.values(typingUsers).filter((name) => name !== session?.user?.name);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col rounded-xl2 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl sm:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
        <div>
          <p className="text-sm font-medium text-ink-primary">Umumiy chat</p>
          <p className="text-[11px] text-ink-tertiary">Guruh a'zolari</p>
        </div>
      </div>

      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5">
        {loading ? (
          <p className="pt-10 text-center text-sm text-ink-tertiary">Yuklanmoqda...</p>
        ) : messages.length === 0 ? (
          <p className="pt-10 text-center text-sm text-ink-tertiary">Hali xabar yo'q. Birinchi bo'lib yozing.</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.authorId === currentUserId}
              isAdmin={!!isAdmin}
              onEdit={editMessage}
              onDelete={deleteMessage}
              onTogglePin={togglePin}
              onReply={setReplyTo}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {typingNames.length > 0 && (
        <p className="px-5 pb-1 text-[11px] italic text-ink-tertiary">
          {typingNames.join(', ')} yozmoqda...
        </p>
      )}

      <MessageComposer
        onSend={sendMessage}
        onTyping={setTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}

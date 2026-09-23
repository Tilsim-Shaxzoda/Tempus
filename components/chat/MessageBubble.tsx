'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2, Pin, Reply, Check, X, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ChatMessage } from '@/types/chat';
import { VoicePlayer } from './VoicePlayer';
import { VideoNotePlayer } from './VideoNotePlayer';
import { formatFileSize } from '@/lib/uploadFile';

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  isAdmin: boolean;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onReply: (message: ChatMessage) => void;
}

export function MessageBubble({ message, isOwn, isAdmin, onEdit, onDelete, onTogglePin, onReply }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [lightbox, setLightbox] = useState(false);
  const bare = message.attachmentType === 'sticker' || message.attachmentType === 'video';

  if (message.isDeleted) {
    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="max-w-[75%] rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-2 text-xs italic text-ink-tertiary">
          Xabar o'chirildi
        </div>
      </div>
    );
  }

  function saveEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) onEdit(message.id, trimmed);
    setEditing(false);
  }

  return (
    <div className={cn('group flex flex-col', isOwn ? 'items-end' : 'items-start')}>
      {!isOwn && (
        <span className="mb-1 px-1 text-[11px] font-medium text-ink-tertiary">{message.author.fullName}</span>
      )}

      <div className={cn('flex max-w-[85%] items-end gap-1.5 sm:max-w-[70%]', isOwn && 'flex-row-reverse')}>
        <div
          className={cn(
            'relative text-sm leading-relaxed',
            bare
              ? 'bg-transparent px-0 py-0'
              : cn(
                  'rounded-2xl px-4 py-2.5',
                  isOwn
                    ? 'rounded-br-md bg-accent/90 text-base-950'
                    : 'rounded-bl-md border border-white/[0.06] bg-white/[0.04] text-ink-primary backdrop-blur-md'
                )
          )}
        >
          {message.isPinned && (
            <Pin
              className={cn(
                'absolute -top-2 right-2 h-3 w-3',
                bare ? 'text-accent' : isOwn ? 'text-base-950/70' : 'text-accent'
              )}
            />
          )}

          {message.replyTo && (
            <div
              className={cn(
                'mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs',
                isOwn ? 'border-base-950/30 bg-base-950/10' : 'border-accent/40 bg-white/[0.03]'
              )}
            >
              <p className="font-medium">{message.replyTo.author.fullName}</p>
              <p className="truncate opacity-70">{message.replyTo.content}</p>
            </div>
          )}

          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                className="w-48 rounded-md bg-black/20 px-2 py-1 text-sm text-inherit outline-none"
              />
              <button onClick={saveEdit} aria-label="Saqlash">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setEditing(false)} aria-label="Bekor qilish">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              {message.attachmentType === 'sticker' && (
                <span className="block text-6xl leading-none">{message.content}</span>
              )}

              {message.attachmentType === 'image' && message.attachmentUrl && (
                <>
                  <button onClick={() => setLightbox(true)} aria-label="Kattalashtirish" className="block overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={message.attachmentUrl}
                      alt={message.attachmentName ?? 'rasm'}
                      className="max-h-72 w-full max-w-xs object-cover"
                    />
                  </button>
                  {message.content && <p className="mt-1.5 whitespace-pre-wrap break-words">{message.content}</p>}
                </>
              )}

              {message.attachmentType === 'video' && message.attachmentUrl && (
                <VideoNotePlayer src={message.attachmentUrl} />
              )}

              {message.attachmentType === 'voice' && message.attachmentUrl && (
                <VoicePlayer src={message.attachmentUrl} duration={message.attachmentDuration} isOwn={isOwn} />
              )}

              {message.attachmentType === 'file' && message.attachmentUrl && (
                <a
                  href={message.attachmentUrl}
                  download={message.attachmentName ?? undefined}
                  className={cn(
                    'flex w-52 items-center gap-2.5 rounded-lg px-2.5 py-2',
                    isOwn ? 'bg-base-950/10' : 'bg-white/[0.03]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                      isOwn ? 'bg-base-950/15' : 'bg-white/[0.06]'
                    )}
                  >
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs">{message.attachmentName ?? 'Fayl'}</span>
                    {typeof message.attachmentSize === 'number' && (
                      <span
                        className={cn('block text-[10px]', isOwn ? 'text-base-950/60' : 'text-ink-tertiary')}
                      >
                        {formatFileSize(message.attachmentSize)}
                      </span>
                    )}
                  </span>
                  <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
                </a>
              )}

              {!message.attachmentType && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
            </>
          )}

          <div
            className={cn(
              'mt-1 flex items-center gap-1.5 text-[10px]',
              bare ? 'text-ink-tertiary' : isOwn ? 'text-base-950/60' : 'text-ink-tertiary'
            )}
          >
            <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
            {message.isEdited && <span>· tahrirlangan</span>}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100 sm:flex">
          <button
            onClick={() => onReply(message)}
            aria-label="Javob berish"
            className="rounded-md p-1.5 text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
          >
            <Reply className="h-3.5 w-3.5" />
          </button>
          {isOwn && !editing && message.attachmentType !== 'voice' && message.attachmentType !== 'video' && message.attachmentType !== 'sticker' && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Tahrirlash"
              className="rounded-md p-1.5 text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {(isOwn || isAdmin) && (
            <button
              onClick={() => onDelete(message.id)}
              aria-label="O'chirish"
              className="rounded-md p-1.5 text-ink-tertiary hover:bg-white/[0.06] hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => onTogglePin(message.id, !message.isPinned)}
              aria-label={message.isPinned ? 'Pin olib tashlash' : 'Pin qilish'}
              className="rounded-md p-1.5 text-ink-tertiary hover:bg-white/[0.06] hover:text-accent"
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {lightbox && message.attachmentUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setLightbox(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.attachmentUrl}
            alt={message.attachmentName ?? 'rasm'}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}

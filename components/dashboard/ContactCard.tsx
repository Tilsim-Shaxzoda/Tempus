'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Copy, MessageCircle, Send, Check } from 'lucide-react';
import type { Contact } from '@/hooks/useContacts';

export function ContactCard({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!contact.phone) return;
    await navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const initials = contact.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-ink-secondary">
          {initials}
        </div>
        {contact.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-base-950 bg-accent" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-primary">{contact.fullName}</p>
        <p className="truncate text-xs text-ink-tertiary">
          {contact.phone ?? '—'} {contact.isOnline && <span className="text-accent">· online</span>}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            aria-label={`${contact.fullName}ga qo'ng'iroq qilish`}
            className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
          </a>
        )}
        {contact.phone && (
          <button
            onClick={handleCopy}
            aria-label="Raqamni nusxalash"
            className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" strokeWidth={1.75} />}
          </button>
        )}
        {contact.telegram && (
          <a
            href={`https://t.me/${contact.telegram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram profili"
            className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </a>
        )}
        <button
          onClick={() => router.push('/chat')}
          aria-label="Chatga o'tish"
          className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

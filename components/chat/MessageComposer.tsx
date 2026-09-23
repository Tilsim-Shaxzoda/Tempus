'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, X, Paperclip, Image as ImageIcon, File as FileIcon, Mic, Video, Smile, Trash2 } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import { uploadFile, formatFileSize, formatDuration, type UploadKind } from '@/lib/uploadFile';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { StickerPicker } from './StickerPicker';

type Attachment = {
  url: string;
  type: 'image' | 'file' | 'voice' | 'video' | 'sticker';
  name?: string | null;
  size?: number | null;
  duration?: number | null;
};

interface Props {
  onSend: (content: string, replyToId?: string | null, attachment?: Attachment | null) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
}

interface PendingFile {
  kind: 'image' | 'file';
  file: File;
  previewUrl: string | null;
}

const MAX_VOICE_SEC = 180;
const MAX_VIDEO_SEC = 60;

export function MessageComposer({ onSend, onTyping, replyTo, onCancelReply }: Props) {
  const [value, setValue] = useState('');
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    };
  }, [pending?.previewUrl]);

  async function sendRecording(blob: Blob, durationSec: number, kind: 'voice' | 'video') {
    try {
      setUploading(true);
      const ext = kind === 'video' ? 'webm' : 'webm';
      const result = await uploadFile(blob, kind as UploadKind, `${kind}-${Date.now()}.${ext}`);
      onSend('', replyTo?.id, { url: result.url, type: kind, duration: durationSec });
      onCancelReply();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  }

  const voiceRecorder = useMediaRecorder({
    kind: 'voice',
    maxDurationSec: MAX_VOICE_SEC,
    onStop: (blob, duration) => sendRecording(blob, duration, 'voice')
  });

  const videoRecorder = useMediaRecorder({
    kind: 'video',
    maxDurationSec: MAX_VIDEO_SEC,
    onStop: (blob, duration) => sendRecording(blob, duration, 'video')
  });

  useEffect(() => {
    if (videoPreviewRef.current && videoRecorder.stream) {
      videoPreviewRef.current.srcObject = videoRecorder.stream;
    }
  }, [videoRecorder.stream]);

  function handleChange(v: string) {
    setValue(v);
    onTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 1500);
  }

  function pickFile(kind: 'image' | 'file') {
    setShowAttachMenu(false);
    setError(null);
    if (kind === 'image') imageInputRef.current?.click();
    else fileInputRef.current?.click();
  }

  function onFileSelected(kind: 'image' | 'file', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending({
      kind,
      file,
      previewUrl: kind === 'image' ? URL.createObjectURL(file) : null
    });
  }

  function cancelPending() {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
  }

  async function handleSubmit() {
    if (uploading) return;
    const trimmed = value.trim();

    if (pending) {
      try {
        setUploading(true);
        setError(null);
        const result = await uploadFile(pending.file, pending.kind, pending.file.name);
        onSend(trimmed, replyTo?.id, {
          url: result.url,
          type: pending.kind,
          name: result.name,
          size: result.size
        });
        cancelPending();
        setValue('');
        onTyping(false);
        onCancelReply();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Yuklashda xatolik');
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!trimmed) return;
    onSend(trimmed, replyTo?.id);
    setValue('');
    onTyping(false);
    onCancelReply();
  }

  function sendSticker(emoji: string) {
    setShowStickers(false);
    onSend(emoji, replyTo?.id, { url: '', type: 'sticker' });
    onCancelReply();
  }

  async function startRecording(kind: 'voice' | 'video') {
    setError(null);
    try {
      await (kind === 'voice' ? voiceRecorder.start() : videoRecorder.start());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ruxsat berilmadi');
    }
  }

  const isRecording = voiceRecorder.recording || videoRecorder.recording;
  const canSend = !uploading && (value.trim().length > 0 || !!pending);

  return (
    <div className="relative border-t border-white/[0.06] bg-white/[0.02] px-3 py-3 backdrop-blur-xl sm:px-4">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileSelected('image', e)}
      />
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => onFileSelected('file', e)} />

      {showStickers && <StickerPicker onPick={sendSticker} onClose={() => setShowStickers(false)} />}

      {showAttachMenu && (
        <div className="absolute bottom-full left-3 mb-2 flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-base-900/95 shadow-xl backdrop-blur-xl">
          <button
            onClick={() => pickFile('image')}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-primary hover:bg-white/[0.06]"
          >
            <ImageIcon className="h-4 w-4 text-accent" /> Rasm
          </button>
          <button
            onClick={() => pickFile('file')}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-primary hover:bg-white/[0.06]"
          >
            <FileIcon className="h-4 w-4 text-accent" /> Fayl
          </button>
        </div>
      )}

      {replyTo && !isRecording && (
        <div className="mb-2 flex items-center justify-between rounded-lg border-l-2 border-accent/50 bg-white/[0.03] px-3 py-1.5">
          <div className="min-w-0 text-xs">
            <p className="font-medium text-ink-secondary">{replyTo.author.fullName}ga javob</p>
            <p className="truncate text-ink-tertiary">{replyTo.content || 'Biriktirilgan fayl'}</p>
          </div>
          <button onClick={onCancelReply} aria-label="Bekor qilish" className="shrink-0 p-1 text-ink-tertiary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {pending && !isRecording && (
        <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
          {pending.kind === 'image' && pending.previewUrl ? (
            <img src={pending.previewUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-ink-tertiary">
              <FileIcon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1 text-xs">
            <p className="truncate text-ink-secondary">{pending.file.name}</p>
            <p className="text-ink-tertiary">{formatFileSize(pending.file.size)}</p>
          </div>
          <button onClick={cancelPending} aria-label="Bekor qilish" className="shrink-0 p-1 text-ink-tertiary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center gap-3">
          {videoRecorder.recording && (
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          )}
          {voiceRecorder.recording && (
            <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />
          )}
          <span className="flex-1 text-sm text-ink-secondary">
            {formatDuration(voiceRecorder.recording ? voiceRecorder.elapsed : videoRecorder.elapsed)} yozilmoqda...
          </span>
          <button
            onClick={() => (voiceRecorder.recording ? voiceRecorder.cancel() : videoRecorder.cancel())}
            aria-label="Bekor qilish"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-tertiary hover:bg-white/[0.06] hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => (voiceRecorder.recording ? voiceRecorder.stop() : videoRecorder.stop())}
            aria-label="Yuborish"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/90 text-base-950 hover:bg-accent"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowAttachMenu((v) => !v)}
            aria-label="Biriktirish"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowStickers((v) => !v)}
            aria-label="Stiker"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
          >
            <Smile className="h-4 w-4" />
          </button>

          <textarea
            rows={1}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Xabar yozing..."
            className="max-h-32 flex-1 resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-accent/40"
          />

          {canSend ? (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              aria-label="Yuborish"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/90 text-base-950 transition hover:bg-accent disabled:opacity-40"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : (
            <>
              <button
                onClick={() => startRecording('video')}
                aria-label="Dumaloq video"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
              >
                <Video className="h-4 w-4" />
              </button>
              <button
                onClick={() => startRecording('voice')}
                aria-label="Ovozli xabar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-tertiary hover:bg-white/[0.06] hover:text-ink-primary"
              >
                <Mic className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

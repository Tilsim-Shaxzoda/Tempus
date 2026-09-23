'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/lib/uploadFile';

interface Props {
  src: string;
  duration: number | null;
  isOwn: boolean;
}

export function VoicePlayer({ src, duration, isOwn }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [total, setTotal] = useState(duration ?? 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setTotal(audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  const progress = total > 0 ? Math.min(1, currentTime / total) : 0;

  return (
    <div className="flex w-52 items-center gap-2.5">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={toggle}
        aria-label={playing ? 'Pauza' : "Ijro etish"}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isOwn ? 'bg-base-950/15 text-base-950' : 'bg-accent/20 text-accent'
        )}
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
      </button>
      <div className="flex-1">
        <div className={cn('h-1 w-full overflow-hidden rounded-full', isOwn ? 'bg-base-950/15' : 'bg-white/10')}>
          <div
            className={cn('h-full rounded-full', isOwn ? 'bg-base-950/60' : 'bg-accent')}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className={cn('mt-1 block text-[10px]', isOwn ? 'text-base-950/60' : 'text-ink-tertiary')}>
          {formatDuration(playing || currentTime > 0 ? currentTime : total)}
        </span>
      </div>
    </div>
  );
}

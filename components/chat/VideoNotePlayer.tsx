'use client';

import { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

export function VideoNotePlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play();
      setPlaying(true);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Pauza' : 'Ijro etish'}
      className="group relative h-40 w-40 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-black/40"
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        playsInline
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-base-950">
            <Play className="ml-0.5 h-4 w-4" />
          </div>
        </div>
      )}
      {playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-base-950">
            <Pause className="h-4 w-4" />
          </div>
        </div>
      )}
    </button>
  );
}

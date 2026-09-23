'use client';

import { useEffect, useRef } from 'react';

const STICKERS = [
  '❤️', '\u{1F970}', '\u{1F618}', '\u{1F339}', '\u{1F525}', '\u{1F60D}',
  '\u{1F929}', '\u{1F917}', '\u{1F973}', '\u{1F60E}', '\u{1F62D}', '\u{1F602}',
  '\u{1F644}', '\u{1F975}', '\u{1F49B}', '\u{1F495}', '\u{1F496}', '\u{1F48B}',
  '\u{1F387}', '\u{1F338}'
];

interface Props {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export function StickerPicker({ onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 grid w-64 grid-cols-5 gap-1 rounded-xl2 border border-white/[0.08] bg-base-900/95 p-3 shadow-xl backdrop-blur-xl"
    >
      {STICKERS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onPick(emoji)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl transition hover:bg-white/[0.06]"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

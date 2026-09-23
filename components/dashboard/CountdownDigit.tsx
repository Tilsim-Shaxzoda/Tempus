'use client';

export function CountdownDigit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(label === 'KUN' ? 1 : 2, '0');

  return (
    <div className="flex flex-col items-center gap-2 px-3 sm:px-6">
      <div className="relative h-12 overflow-hidden sm:h-16">
        <span
          key={display}
          className="block animate-digit-in font-mono text-3xl font-semibold tabular-nums text-ink-primary sm:text-5xl"
        >
          {display}
        </span>
      </div>
      <span className="text-[10px] font-medium tracking-wide text-ink-tertiary sm:text-xs">
        {label}
      </span>
    </div>
  );
}

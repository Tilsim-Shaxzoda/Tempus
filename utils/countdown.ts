export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
  percentElapsed: number;
}

/**
 * Pure function: given a start, a target, and "now", compute the countdown parts.
 */
export function computeCountdown(startAt: Date, targetAt: Date, now: Date): CountdownParts {
  const totalMs = Math.max(targetAt.getTime() - startAt.getTime(), 1);
  const remainingMs = Math.max(targetAt.getTime() - now.getTime(), 0);
  const elapsedMs = Math.min(Math.max(now.getTime() - startAt.getTime(), 0), totalMs);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isFinished: remainingMs <= 0,
    percentElapsed: Math.round((elapsedMs / totalMs) * 100)
  };
}

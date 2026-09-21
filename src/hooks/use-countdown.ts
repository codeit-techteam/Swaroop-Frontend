import { useEffect, useMemo, useState } from 'react';

const TOTAL_RESPONSE_WINDOW_MS = 15 * 60 * 1000;

export type CountdownSnapshot = {
  remainingMs: number;
  totalMs: number;
  minutes: number;
  seconds: number;
  /** MM:SS */
  label: string;
  /** 0–1 fraction remaining */
  progress: number;
  /** 0–100 percent elapsed */
  elapsedPercent: number;
  isExpired: boolean;
  isUrgent: boolean;
};

function computeCountdown(
  deadlineIso?: string | null,
  totalMs = TOTAL_RESPONSE_WINDOW_MS,
): CountdownSnapshot {
  const end = deadlineIso ? new Date(deadlineIso).getTime() : Number.NaN;
  const remainingMs = Number.isFinite(end) ? Math.max(0, end - Date.now()) : totalMs;
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const progress = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0;

  return {
    remainingMs,
    totalMs,
    minutes,
    seconds,
    label: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    progress,
    elapsedPercent: Math.round((1 - progress) * 100),
    isExpired: Number.isFinite(end) ? remainingMs <= 0 : false,
    isUrgent: remainingMs > 0 && remainingMs <= 3 * 60 * 1000,
  };
}

/**
 * Live countdown that ticks every second until the deadline.
 * If no deadline is provided, starts a fresh 15-minute window from mount.
 */
export function useCountdown(
  deadlineIso?: string | null,
  totalMs: number = TOTAL_RESPONSE_WINDOW_MS,
): CountdownSnapshot {
  const resolvedDeadline = useMemo(() => {
    if (deadlineIso && !Number.isNaN(new Date(deadlineIso).getTime())) {
      return deadlineIso;
    }
    return new Date(Date.now() + totalMs).toISOString();
  }, [deadlineIso, totalMs]);

  const [snapshot, setSnapshot] = useState(() =>
    computeCountdown(resolvedDeadline, totalMs),
  );

  useEffect(() => {
    setSnapshot(computeCountdown(resolvedDeadline, totalMs));
    const id = setInterval(() => {
      setSnapshot(computeCountdown(resolvedDeadline, totalMs));
    }, 1000);
    return () => clearInterval(id);
  }, [resolvedDeadline, totalMs]);

  return snapshot;
}

export const SELLER_RESPONSE_WINDOW_MS = TOTAL_RESPONSE_WINDOW_MS;

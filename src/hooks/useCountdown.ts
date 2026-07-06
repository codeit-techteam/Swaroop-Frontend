import { useEffect, useMemo, useRef, useState } from 'react';

type UseCountdownOptions = {
  startedAt: string | null;
  durationSeconds: number;
  isActive?: boolean;
  onExpire?: () => void;
};

type UseCountdownResult = {
  remainingSeconds: number;
  formattedTime: string;
  isExpired: boolean;
  minutes: number;
  seconds: number;
};

const padTimeUnit = (value: number): string => value.toString().padStart(2, '0');

const formatCountdown = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${padTimeUnit(minutes)}:${padTimeUnit(seconds)}`;
};

const getRemainingSeconds = (startedAt: string | null, durationSeconds: number): number => {
  if (!startedAt || durationSeconds <= 0) {
    return durationSeconds;
  }

  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  return Math.max(0, durationSeconds - elapsedSeconds);
};

export const useCountdown = ({
  startedAt,
  durationSeconds,
  isActive = true,
  onExpire,
}: UseCountdownOptions): UseCountdownResult => {
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  onExpireRef.current = onExpire;

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(startedAt, durationSeconds),
  );

  useEffect(() => {
    setRemainingSeconds(getRemainingSeconds(startedAt, durationSeconds));
    hasExpiredRef.current = false;
  }, [durationSeconds, startedAt]);

  useEffect(() => {
    if (!isActive || !startedAt || durationSeconds <= 0) {
      return;
    }

    const tick = (): void => {
      const nextRemaining = getRemainingSeconds(startedAt, durationSeconds);
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current?.();
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [durationSeconds, isActive, startedAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return useMemo(
    () => ({
      remainingSeconds,
      formattedTime: formatCountdown(remainingSeconds),
      isExpired: remainingSeconds <= 0,
      minutes,
      seconds,
    }),
    [minutes, remainingSeconds, seconds],
  );
};

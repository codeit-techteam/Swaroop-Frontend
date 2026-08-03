import { useCallback, useEffect, useState } from 'react';

const DEFAULT_SKELETON_MS = 1200;

export function useSkeletonLoading(delayMs = DEFAULT_SKELETON_MS): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const reset = useCallback(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  void reset;

  return isLoading;
}

export function useDelayedLoading(active: boolean, delayMs = DEFAULT_SKELETON_MS): boolean {
  const [isLoading, setIsLoading] = useState(active);

  useEffect(() => {
    if (!active) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return isLoading;
}

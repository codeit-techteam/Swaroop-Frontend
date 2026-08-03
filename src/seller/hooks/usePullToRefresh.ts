import { useCallback, useState } from 'react';

const DEFAULT_REFRESH_MS = 1500;

export function usePullToRefresh(onRefresh: () => Promise<void>, delayMs = DEFAULT_REFRESH_MS) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const start = Date.now();
    try {
      await onRefresh();
    } finally {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, delayMs - elapsed);
      if (remaining > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, remaining));
      }
      setIsRefreshing(false);
    }
  }, [delayMs, isRefreshing, onRefresh]);

  return { isRefreshing, refresh };
}

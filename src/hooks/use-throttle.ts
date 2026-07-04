import { useCallback, useEffect, useRef } from 'react';

export const useThrottledCallback = <T extends (...args: never[]) => void>(
  callback: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  const callbackRef = useRef(callback);
  const inThrottleRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callbackRef.current(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    [limit],
  );
};

import { useCallback, useEffect, useRef, useState } from 'react';

import { AppState } from 'react-native';

import { useFocusEffect } from 'expo-router';

import type { CustomerKycOverview } from '@/services/customer-kyc';
import { refreshKycStatus } from '@/services/kyc-status-sync';

type Options = {
  /** Re-check on an interval while the screen is focused, e.g. while waiting for review. */
  pollMs?: number;
};

/**
 * Live customer KYC review status, refreshed on focus, when the app returns to
 * the foreground, and optionally on an interval. Each refresh also updates the
 * auth store, so an admin decision unlocks (or re-locks) the app without a restart.
 */
export function useCustomerKycStatus({ pollMs }: Options = {}) {
  const [overview, setOverview] = useState<CustomerKycOverview | null>(null);
  const [loaded, setLoaded] = useState(false);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    const next = await refreshKycStatus();
    if (request !== requestRef.current) return null;
    if (next) setOverview(next);
    setLoaded(true);
    return next;
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      const interval = pollMs ? setInterval(() => void refresh(), pollMs) : null;
      return () => {
        requestRef.current += 1;
        if (interval) clearInterval(interval);
      };
    }, [pollMs, refresh]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  return { overview, loaded, refresh };
}

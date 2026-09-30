import { useCallback, useRef, useState } from 'react';

import { useFocusEffect } from 'expo-router';

import {
  fetchSellerOnboardingStatus,
  type SellerOnboardingStatus,
} from '@/services/seller-onboarding';
import { logger } from '@/utils/logger';

/**
 * Live onboarding review status, refreshed whenever the screen gains focus so an
 * admin change request or decision shows up without restarting the app.
 */
export function useSellerVerificationStatus() {
  const [status, setStatus] = useState<SellerOnboardingStatus | null>(null);
  const [loaded, setLoaded] = useState(false);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    try {
      const next = await fetchSellerOnboardingStatus();
      if (request === requestRef.current) setStatus(next);
    } catch (error) {
      logger.warn('Seller verification status failed', {
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (request === requestRef.current) setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      return () => {
        requestRef.current += 1;
      };
    }, [refresh]),
  );

  return { status, loaded, refresh };
}

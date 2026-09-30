import { useCallback, useRef, useState } from 'react';

import { useFocusEffect } from 'expo-router';

import { fetchCustomerKyc, type CustomerKycOverview } from '@/services/customer-kyc';
import { logger } from '@/utils/logger';

/**
 * Live customer KYC review status, refreshed whenever the screen gains focus so
 * an admin change request or decision shows up without restarting the app.
 */
export function useCustomerKycStatus() {
  const [overview, setOverview] = useState<CustomerKycOverview | null>(null);
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    try {
      const next = await fetchCustomerKyc();
      if (request === requestRef.current) setOverview(next);
    } catch (error) {
      logger.warn('Customer KYC status failed', {
        message: error instanceof Error ? error.message : String(error),
      });
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

  return { overview, refresh };
}

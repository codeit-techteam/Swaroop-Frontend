import { useCallback, useState } from 'react';

import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import {
  getSecuritySnapshot,
  logoutAllDevices,
  updateSecuritySettings,
} from '@/seller/services/securityService';
import type { SecuritySettings } from '@/seller/types/security';

export function useSellerSecurity() {
  const [snapshot, setSnapshot] = useState(getSecuritySnapshot);
  const isLoading = useSkeletonLoading();

  const updateSetting = useCallback((patch: Partial<SecuritySettings>) => {
    updateSecuritySettings(patch);
    setSnapshot(getSecuritySnapshot());
  }, []);

  const handleLogoutAll = useCallback(async () => {
    await logoutAllDevices();
  }, []);

  return {
    snapshot,
    isLoading,
    updateSetting,
    handleLogoutAll,
  };
}

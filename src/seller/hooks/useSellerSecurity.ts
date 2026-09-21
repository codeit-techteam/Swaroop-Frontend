import { useCallback, useState } from 'react';

import {
  getSecuritySnapshot,
  logoutAllDevices,
  updateSecuritySettings,
} from '@/seller/services/securityService';
import type { SecuritySettings } from '@/seller/types/security';

export function useSellerSecurity() {
  const [snapshot, setSnapshot] = useState(() => getSecuritySnapshot());
  // Local snapshot is available synchronously.
  const isLoading = false;

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

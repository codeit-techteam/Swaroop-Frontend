import { useCallback, useState } from 'react';

import {
  clearAppCache,
  getAppSettings,
  getAppVersion,
  updateAppSettings,
} from '@/seller/services/settingsService';
import type { SellerAppSettings } from '@/seller/types/settings';

export function useSellerSettings() {
  const [settings, setSettings] = useState<SellerAppSettings>(getAppSettings);

  const updateSetting = useCallback(
    <K extends keyof SellerAppSettings>(key: K, value: SellerAppSettings[K]) => {
      const next = updateAppSettings({ [key]: value });
      setSettings(next);
    },
    [],
  );

  const clearCache = useCallback(async () => {
    await clearAppCache();
  }, []);

  return {
    settings,
    appVersion: getAppVersion(),
    updateSetting,
    clearCache,
    /** Settings are read synchronously from local storage on first render. */
    isReady: true as const,
  };
}

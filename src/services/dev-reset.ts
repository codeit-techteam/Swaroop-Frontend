import { DEV_RESET_VERSION, DEVELOPMENT_MODE } from '@/config/development';
import { clearAll } from '@/services/storage';
import { getStorageItem, setStorageItem } from '@/utils/storage';

const DEV_RESET_MARKER_KEY = 'swaroop_dev_reset_version';

/**
 * Wipes persisted storage exactly once per {@link DEV_RESET_VERSION} value.
 * Must run after secure storage has hydrated so the marker is readable.
 */
export const applyDevResetIfNeeded = async (): Promise<boolean> => {
  if (!DEVELOPMENT_MODE || DEV_RESET_VERSION <= 0) {
    return false;
  }

  const appliedVersion = Number(getStorageItem(DEV_RESET_MARKER_KEY) ?? 0);
  if (appliedVersion >= DEV_RESET_VERSION) {
    return false;
  }

  await clearAll();
  setStorageItem(DEV_RESET_MARKER_KEY, DEV_RESET_VERSION);
  return true;
};

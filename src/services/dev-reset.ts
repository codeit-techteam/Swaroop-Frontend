import { DEV_RESET_VERSION, DEVELOPMENT_MODE } from '@/config/development';
import { STORAGE_KEYS } from '@/constants';
import { clearAll } from '@/services/storage';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

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

const SELLER_IDENTITY_MARKER_KEY = 'swaroop_seller_identity_version';
const SELLER_IDENTITY_VERSION = 1;

/**
 * Older builds signed the demo seller phone into seller@test.local instead of
 * the phone's own account. Drop that backend session once (seller only) so the
 * next request re-authenticates as the same seller Seller Web shows.
 */
export const applySellerIdentityMigration = (): boolean => {
  if (!DEVELOPMENT_MODE) return false;
  const applied = Number(getStorageItem(SELLER_IDENTITY_MARKER_KEY) ?? 0);
  if (applied >= SELLER_IDENTITY_VERSION) return false;

  setStorageItem(SELLER_IDENTITY_MARKER_KEY, SELLER_IDENTITY_VERSION);
  if (getStorageItem(STORAGE_KEYS.SELLER_LOGGED_IN) !== 'true') return false;

  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
  removeStorageItem(STORAGE_KEYS.SELLER_ACCESS);
  removeStorageItem(STORAGE_KEYS.SELLER_ACCOUNT);
  return true;
};

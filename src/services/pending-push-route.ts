import { STORAGE_KEYS } from '@/constants';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

const CUSTOMER_PREFIX = '/(customer)/';
const SELLER_PREFIX = '/(seller)/';
const SELLER_AUTH = new Set([
  '/(seller)/login',
  '/(seller)/register',
  '/(seller)/otp',
  '/(seller)/company',
  '/(seller)/verification',
  '/(seller)/verification-submitted',
  '/(seller)/review',
]);

/** Internal screen saved when a notification is opened without a session. */
export const isPendingPushRoute = (route: string): boolean => {
  if (!route.startsWith('/') || route.startsWith('//') || route.includes('://')) return false;
  const path = route.split('?')[0] ?? route;
  if (path.startsWith(CUSTOMER_PREFIX)) return true;
  if (!path.startsWith(SELLER_PREFIX)) return false;
  return !SELLER_AUTH.has(path);
};

export const rememberPendingPushRoute = (route: string): void => {
  if (!isPendingPushRoute(route)) return;
  setStorageItem(STORAGE_KEYS.PENDING_PUSH_ROUTE, route);
};

export const peekPendingPushRoute = (): string | null => {
  const value = getStorageItem(STORAGE_KEYS.PENDING_PUSH_ROUTE);
  if (!value || !isPendingPushRoute(value)) {
    if (value) removeStorageItem(STORAGE_KEYS.PENDING_PUSH_ROUTE);
    return null;
  }
  return value;
};

export const consumePendingPushRoute = (
  audience: 'customer' | 'seller',
): string | null => {
  const value = peekPendingPushRoute();
  if (!value) return null;
  const matches =
    audience === 'seller' ? value.startsWith(SELLER_PREFIX) : value.startsWith(CUSTOMER_PREFIX);
  if (!matches) return null;
  removeStorageItem(STORAGE_KEYS.PENDING_PUSH_ROUTE);
  return value;
};

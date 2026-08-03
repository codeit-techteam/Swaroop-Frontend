import { STORAGE_KEYS } from '@/constants';
import { APP_VERSION, DEFAULT_APP_SETTINGS } from '@/seller/mock/settings';
import type { SellerAppSettings } from '@/seller/types/settings';
import { getStorageItem, setStorageItem } from '@/utils/storage';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadSettings(): SellerAppSettings {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_APP_SETTINGS);
  if (!raw) return { ...DEFAULT_APP_SETTINGS };
  try {
    return { ...DEFAULT_APP_SETTINGS, ...(JSON.parse(raw) as Partial<SellerAppSettings>) };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

let settingsCache = loadSettings();

export function getAppSettings(): SellerAppSettings {
  return { ...settingsCache };
}

export function updateAppSettings(patch: Partial<SellerAppSettings>): SellerAppSettings {
  settingsCache = { ...settingsCache, ...patch };
  setStorageItem(STORAGE_KEYS.SELLER_APP_SETTINGS, JSON.stringify(settingsCache));
  return { ...settingsCache };
}

export async function clearAppCache(): Promise<void> {
  await delay(800);
  // Mock cache clear — settings persist
}

export function getAppVersion(): string {
  return APP_VERSION;
}

export function isMockOffline(): boolean {
  return settingsCache.mockOffline;
}

export function setMockOffline(value: boolean): void {
  updateAppSettings({ mockOffline: value });
}

import { STORAGE_KEYS } from '@/constants';
import { getStorageItem, setStorageItem } from '@/utils/storage';

const MAX_RECENT_SEARCHES = 8;

const readRecent = (): string[] => {
  const raw = getStorageItem(STORAGE_KEYS.CUSTOMER_RECENT_SEARCHES);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
    );
  } catch {
    return [];
  }
};

export const getRecentMarketSearches = (): string[] => readRecent();

export const addRecentMarketSearch = (term: string): string[] => {
  const normalized = term.trim();
  if (normalized.length < 2) {
    return readRecent();
  }

  const next = [
    normalized,
    ...readRecent().filter((entry) => entry.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);

  setStorageItem(STORAGE_KEYS.CUSTOMER_RECENT_SEARCHES, JSON.stringify(next));
  return next;
};

export const clearRecentMarketSearches = (): void => {
  setStorageItem(STORAGE_KEYS.CUSTOMER_RECENT_SEARCHES, JSON.stringify([]));
};

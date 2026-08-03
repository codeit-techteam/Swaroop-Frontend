import { STORAGE_KEYS } from '@/constants';
import { DEFAULT_SEARCH_SNAPSHOT, MOCK_SEARCH_INDEX } from '@/seller/mock/search';
import type { SearchCategory, SearchResult, SearchSnapshot } from '@/seller/types/search';
import { getStorageItem, setStorageItem } from '@/utils/storage';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RECENT = 8;

function loadRecentSearches(): string[] {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_RECENT_SEARCHES);
  if (!raw) return [...DEFAULT_SEARCH_SNAPSHOT.recentSearches];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [...DEFAULT_SEARCH_SNAPSHOT.recentSearches];
  }
}

function persistRecentSearches(searches: string[]): void {
  setStorageItem(STORAGE_KEYS.SELLER_RECENT_SEARCHES, JSON.stringify(searches));
}

let recentSearches = loadRecentSearches();

export function getSearchSnapshot(): SearchSnapshot {
  return {
    recentSearches,
    popularSearches: DEFAULT_SEARCH_SNAPSHOT.popularSearches,
  };
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  recentSearches = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
    0,
    MAX_RECENT,
  );
  persistRecentSearches(recentSearches);
}

export function clearRecentSearches(): void {
  recentSearches = [];
  persistRecentSearches(recentSearches);
}

export async function searchSellerData(
  query: string,
  category: SearchCategory,
): Promise<SearchResult[]> {
  await delay(400);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return MOCK_SEARCH_INDEX.filter((result) => {
    const matchesCategory =
      category === 'all' ||
      (category === 'products' && result.type === 'product') ||
      (category === 'orders' && result.type === 'order') ||
      (category === 'offers' && result.type === 'offer') ||
      (category === 'shipments' && result.type === 'shipment') ||
      (category === 'inventory' && result.type === 'inventory') ||
      (category === 'documents' && result.type === 'document');

    const matchesQuery =
      result.title.toLowerCase().includes(normalized) ||
      result.subtitle.toLowerCase().includes(normalized);

    return matchesCategory && matchesQuery;
  });
}

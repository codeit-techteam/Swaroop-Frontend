import { PAGINATION, STORAGE_KEYS } from '@/constants';
import { fetchSellerDocuments } from '@/services/seller-operations';
import type {
  DocumentFilterTab,
  DocumentsSnapshot,
  SellerDocumentItem,
} from '@/seller/types/documents';
import { getStorageItem, setStorageItem } from '@/utils/storage';

const PAGE_SIZE = PAGINATION.DEFAULT_LIMIT;

let documentsCache: SellerDocumentItem[] = [];

export function filterDocuments(
  documents: SellerDocumentItem[],
  query: string,
  tab: DocumentFilterTab,
): SellerDocumentItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return documents.filter((doc) => {
    const matchesQuery =
      !normalizedQuery ||
      doc.name.toLowerCase().includes(normalizedQuery) ||
      doc.section.toLowerCase().includes(normalizedQuery);

    const matchesTab =
      tab === 'all' ||
      (tab === 'verified' && doc.status === 'verified') ||
      (tab === 'pending' && doc.status === 'pending') ||
      (tab === 'invoices' &&
        (doc.category === 'invoice' ||
          doc.category === 'settlement' ||
          doc.category === 'purchase_order')) ||
      (tab === 'certificates' && doc.category === 'certificate');

    return matchesQuery && matchesTab;
  });
}

export function paginateDocuments(
  documents: SellerDocumentItem[],
  page: number,
): DocumentsSnapshot {
  const end = page * PAGE_SIZE;
  const paginated = documents.slice(0, end);

  return {
    documents: paginated,
    totalCount: documents.length,
    page,
    hasMore: end < documents.length,
  };
}

export async function fetchDocuments(
  query: string,
  tab: DocumentFilterTab,
  page: number,
): Promise<DocumentsSnapshot> {
  const live = await fetchSellerDocuments();
  documentsCache = live;
  const filtered = filterDocuments(documentsCache, query, tab);
  return paginateDocuments(filtered, page);
}

export async function refreshDocuments(): Promise<void> {
  documentsCache = await fetchSellerDocuments();
}

export function getDocumentById(documentId: string): SellerDocumentItem | undefined {
  return documentsCache.find((doc) => doc.id === documentId);
}

export type FilterPreferences = {
  status?: string[];
  warehouse?: string[];
  material?: string[];
  destination?: string[];
  dateRange?: { from: string; to: string };
  priceRange?: { min: number; max: number };
  stockRange?: { min: number; max: number };
  paymentMethod?: string[];
};

export function getFilterPreferences(module: string): FilterPreferences {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_FILTER_PREFS);
  if (!raw) return {};
  try {
    const all = JSON.parse(raw) as Record<string, FilterPreferences>;
    return all[module] ?? {};
  } catch {
    return {};
  }
}

export function saveFilterPreferences(module: string, prefs: FilterPreferences): void {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_FILTER_PREFS);
  let all: Record<string, FilterPreferences> = {};
  try {
    all = raw ? (JSON.parse(raw) as Record<string, FilterPreferences>) : {};
  } catch {
    all = {};
  }
  all[module] = prefs;
  setStorageItem(STORAGE_KEYS.SELLER_FILTER_PREFS, JSON.stringify(all));
}

export function resetFilterPreferences(module: string): void {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_FILTER_PREFS);
  if (!raw) return;
  try {
    const all = JSON.parse(raw) as Record<string, FilterPreferences>;
    delete all[module];
    setStorageItem(STORAGE_KEYS.SELLER_FILTER_PREFS, JSON.stringify(all));
  } catch {
    // ignore
  }
}

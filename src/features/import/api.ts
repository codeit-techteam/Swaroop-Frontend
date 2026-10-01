import { apiClient } from '@/api/client';
import { sidePath } from '@/features/import/config';
import type {
  ImportBrand,
  ImportDeal,
  ImportDocument,
  ImportGrade,
  ImportListing,
  ImportListingInput,
  ImportMasterBundle,
  ImportMatch,
  ImportNegotiation,
  ImportNegotiationDetail,
  ImportPaymentTerm,
  ImportPort,
  ImportProduct,
  ImportSide,
  ImportSummary,
  ImportTermsInput,
  Paged,
} from '@/features/import/types';
import { ensureDevBackendSession, resolveDevBackendRole } from '@/services/backend-session';
import { putFileToSignedUrl } from '@/services/customer-credit';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: Paged<unknown>['meta'];
};

type Query = Record<string, string | number | undefined | null>;

function qs(query: Query): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

const session = () => ensureDevBackendSession(resolveDevBackendRole());

const idem = (key?: string) => (key ? { headers: { 'Idempotency-Key': key } } : undefined);

async function get<T>(url: string): Promise<T> {
  await session();
  return (await apiClient.get<Envelope<T>>(url)).data.data;
}

async function getPaged<T>(url: string): Promise<Paged<T>> {
  await session();
  const body = (await apiClient.get<Envelope<T[]>>(url)).data;
  return {
    items: body.data ?? [],
    meta: body.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

async function post<T>(url: string, body: unknown = {}, key?: string): Promise<T> {
  await session();
  return (await apiClient.post<Envelope<T>>(url, body, idem(key))).data.data;
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  await session();
  return (await apiClient.patch<Envelope<T>>(url, body)).data.data;
}

async function del(url: string): Promise<void> {
  await session();
  await apiClient.delete(url);
}

// Config & master data ------------------------------------------------------

export const fetchImportConfig = () =>
  get<{ enabled: boolean; serverTime: string }>('/import/config');

export const fetchImportSummary = () => get<ImportSummary>('/import/summary');

export const fetchImportMaster = () => get<ImportMasterBundle>('/import/master-data');

export const fetchImportProducts = (search?: string) =>
  get<ImportProduct[]>(`/import/master-data/products${qs({ search })}`);

export const fetchImportGrades = (categoryId?: string, search?: string) =>
  get<ImportGrade[]>(`/import/master-data/grades${qs({ categoryId, search, limit: 50 })}`);

export const fetchImportBrands = (search?: string) =>
  get<ImportBrand[]>(`/import/master-data/brands${qs({ search })}`);

export const fetchImportPorts = (search?: string) =>
  get<ImportPort[]>(`/import/master-data/ports${qs({ search })}`);

export const fetchImportPaymentTerms = (currencyCode?: string) =>
  get<ImportPaymentTerm[]>(`/import/master-data/payment-terms${qs({ currencyCode })}`);

// Listings ------------------------------------------------------------------

export type ListingQuery = {
  scope?: 'mine' | 'market';
  status?: string;
  search?: string;
  categoryId?: string;
  originCountryId?: string;
  incotermId?: string;
  polId?: string;
  podId?: string;
  priceMin?: string;
  priceMax?: string;
  shipmentFrom?: string;
  shipmentTo?: string;
  currencyCode?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export const fetchListings = (side: ImportSide, query: ListingQuery) =>
  getPaged<ImportListing>(`${sidePath(side)}${qs(query)}`);

export const fetchListing = (side: ImportSide, id: string) =>
  get<ImportListing>(`${sidePath(side)}/${id}`);

export const createListing = (side: ImportSide, input: ImportListingInput) =>
  post<ImportListing>(sidePath(side), { ...input, source: 'MOBILE' });

export const updateListing = (
  side: ImportSide,
  id: string,
  input: ImportListingInput & { version: number },
) => patch<ImportListing>(`${sidePath(side)}/${id}`, input);

export const deleteListing = (side: ImportSide, id: string) => del(`${sidePath(side)}/${id}`);

export const publishListing = (side: ImportSide, id: string, idempotencyKey: string) =>
  post<ImportListing>(`${sidePath(side)}/${id}/publish`, {}, idempotencyKey);

export const transitionListing = (
  side: ImportSide,
  id: string,
  action: 'cancel' | 'expire' | 'pause' | 'resume',
  reason?: string,
) =>
  post<ImportListing>(
    `${sidePath(side)}/${id}/${action}`,
    action === 'cancel' && reason ? { reason } : {},
  );

export const fetchMatches = (side: ImportSide, id: string) =>
  get<ImportMatch[]>(`${sidePath(side)}/${id}/matches`);

export const dismissMatch = (side: ImportSide, id: string, matchId: string) =>
  post<unknown>(`${sidePath(side)}/${id}/matches/${matchId}/dismiss`);

// Documents -----------------------------------------------------------------

export const fetchListingDocuments = (listingId: string) =>
  get<ImportDocument[]>(`/import/listings/${listingId}/documents`);

/** Creates the document row, uploads to the signed R2 URL, then confirms. */
export async function uploadListingDocument(
  listingId: string,
  category: string,
  file: { uri: string; name: string; size: number; mimeType: string },
): Promise<void> {
  const created = await post<{ id: string; uploadUrl?: string | null }>(
    `/import/listings/${listingId}/documents`,
    {
      category,
      fileName: file.name,
      mimeType: file.mimeType,
      fileSizeBytes: file.size,
    },
  );
  if (!created?.id || !created.uploadUrl) {
    throw new Error('Storage upload URL was not issued. Please try again.');
  }
  try {
    await putFileToSignedUrl(created.uploadUrl, { uri: file.uri, mimeType: file.mimeType });
    await post(`/import/listings/${listingId}/documents/${created.id}/confirm`);
  } catch (error) {
    await del(`/import/listings/${listingId}/documents/${created.id}`).catch(() => undefined);
    throw error;
  }
}

export const downloadListingDocument = (listingId: string, documentId: string) =>
  get<{ url: string }>(`/import/listings/${listingId}/documents/${documentId}/download`);

export const deleteListingDocument = (listingId: string, documentId: string) =>
  del(`/import/listings/${listingId}/documents/${documentId}`);

// Negotiations & deals ------------------------------------------------------

export const fetchNegotiations = (query: {
  status?: string;
  listingId?: string;
  page?: number;
  limit?: number;
}) => getPaged<ImportNegotiation>(`/import/negotiations${qs(query)}`);

export const fetchNegotiation = (id: string) =>
  get<ImportNegotiationDetail>(`/import/negotiations/${id}`);

export const openNegotiation = (
  input: ImportTermsInput & {
    listingId: string;
    counterListingId?: string;
    price: string;
    quantity: string;
  },
  idempotencyKey: string,
) => post<ImportNegotiationDetail>('/import/negotiations', input, idempotencyKey);

export const counterNegotiation = (id: string, input: ImportTermsInput, idempotencyKey: string) =>
  post<ImportNegotiationDetail>(`/import/negotiations/${id}/counter`, input, idempotencyKey);

export const acceptNegotiation = (id: string, idempotencyKey: string) =>
  post<ImportNegotiationDetail>(`/import/negotiations/${id}/accept`, {}, idempotencyKey);

export const closeNegotiation = (id: string, action: 'reject' | 'withdraw', note?: string) =>
  post<unknown>(`/import/negotiations/${id}/${action}`, note ? { note } : {});

export const fetchDeals = (query: { status?: string; page?: number; limit?: number }) =>
  getPaged<ImportDeal>(`/import/deals${qs(query)}`);

export const fetchDeal = (id: string) => get<ImportDeal>(`/import/deals/${id}`);

export const confirmDeal = (id: string, idempotencyKey: string) =>
  post<ImportDeal>(`/import/deals/${id}/confirm`, {}, idempotencyKey);

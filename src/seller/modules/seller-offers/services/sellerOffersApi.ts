import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { total?: number; totalPages?: number };
  message?: string;
};

export type BackendOfferStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'PAUSED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CLOSED'
  | 'NEED_CHANGES';

export type BackendPriceTier = {
  id?: string;
  minQty?: number | string;
  maxQty?: number | string | null;
  price?: number | string;
  currency?: string;
};

export type BackendOffer = {
  id: string;
  referenceNumber?: string;
  productId?: string;
  gradeId?: string;
  warehouseId?: string | null;
  inventoryId?: string | null;
  quantity?: number | string;
  moq?: number | string | null;
  unit?: string | null;
  basePrice?: number | string;
  status?: BackendOfferStatus | string;
  validFrom?: string | null;
  validUntil?: string | null;
  version?: number;
  deliveryTerms?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  product?: { id?: string; code?: string; name?: string } | null;
  grade?: {
    id?: string;
    code?: string;
    name?: string;
    displayName?: string | null;
  } | null;
  warehouse?: {
    id?: string;
    code?: string;
    name?: string;
    city?: string | null;
    state?: string | null;
  } | null;
  inventory?: {
    id?: string;
    availableQty?: number | string;
    reservedQty?: number | string;
    warehouseId?: string | null;
  } | null;
  priceTiers?: BackendPriceTier[];
  _count?: { purchaseRequestItems?: number };
};

export type BackendOfferSummary = {
  active?: number;
  draft?: number;
  paused?: number;
  expired?: number;
  pendingReview?: number;
  closed?: number;
  rejected?: number;
  total?: number;
  pendingPurchaseRequests?: number;
  expiringSoon?: number;
  soldOut?: number;
};

export type CreateBackendOfferPayload = {
  productId: string;
  gradeId?: string;
  inventoryId?: string;
  warehouseId?: string;
  quantity: number;
  moq?: number;
  unit?: string;
  basePrice: number;
  validFrom?: string;
  validUntil?: string;
  deliveryTerms?: string;
  metadata?: Record<string, unknown>;
  priceTiers?: Array<{
    minQty: number;
    maxQty?: number;
    price: number;
  }>;
};

export type UpdateBackendOfferPayload = Partial<CreateBackendOfferPayload> & {
  version?: number;
};

export type ListOffersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: BackendOfferStatus | string;
  warehouseId?: string;
};

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

export async function listSellerOffers(
  params: ListOffersParams = {},
): Promise<{ items: BackendOffer[]; meta?: Envelope<BackendOffer[]>['meta'] }> {
  return withSellerSession(async () => {
    const pages: BackendOffer[] = [];
    let page = params.page ?? 1;
    let totalPages = 1;
    const limit = params.limit ?? 100;

    do {
      const payload = await apiClient.get<Envelope<BackendOffer[]>>('/seller/offers', {
        params: {
          page,
          limit,
          search: params.search?.trim() || undefined,
          status: params.status,
          warehouseId: params.warehouseId,
        },
      });
      pages.push(...(payload.data.data ?? []));
      totalPages = payload.data.meta?.totalPages ?? 1;
      page += 1;
    } while (!params.page && page <= totalPages && page <= 10);

    return { items: pages, meta: { total: pages.length, totalPages } };
  });
}

export async function fetchSellerOffersSummary(): Promise<BackendOfferSummary> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendOfferSummary>>('/seller/offers/summary');
    return payload.data.data ?? {};
  });
}

export async function fetchSellerOffer(id: string): Promise<BackendOffer> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendOffer>>(`/seller/offers/${id}`);
    const offer = payload.data.data;
    if (!offer) {
      throw new Error('Offer not found');
    }
    return offer;
  });
}

export async function createSellerOffer(
  body: CreateBackendOfferPayload,
): Promise<BackendOffer> {
  return withSellerSession(async () => {
    const payload = await apiClient.post<Envelope<BackendOffer>>('/seller/offers', body);
    const offer = payload.data.data;
    if (!offer) {
      throw new Error(payload.data.message ?? 'Failed to create offer');
    }
    return offer;
  });
}

export async function updateSellerOffer(
  id: string,
  body: UpdateBackendOfferPayload,
): Promise<BackendOffer> {
  return withSellerSession(async () => {
    const payload = await apiClient.patch<Envelope<BackendOffer>>(
      `/seller/offers/${id}`,
      body,
    );
    const offer = payload.data.data;
    if (!offer) {
      throw new Error(payload.data.message ?? 'Failed to update offer');
    }
    return offer;
  });
}

export async function activateSellerOffer(id: string): Promise<BackendOffer> {
  return withSellerSession(async () => {
    const payload = await apiClient.post<Envelope<BackendOffer>>(
      `/seller/offers/${id}/activate`,
    );
    return payload.data.data ?? (await fetchSellerOffer(id));
  });
}

export async function pauseSellerOffer(id: string): Promise<BackendOffer> {
  return withSellerSession(async () => {
    const payload = await apiClient.post<Envelope<BackendOffer>>(
      `/seller/offers/${id}/pause`,
    );
    return payload.data.data ?? (await fetchSellerOffer(id));
  });
}

export async function cancelSellerOffer(id: string): Promise<BackendOffer> {
  return withSellerSession(async () => {
    const payload = await apiClient.post<Envelope<BackendOffer>>(
      `/seller/offers/${id}/cancel`,
    );
    return payload.data.data ?? (await fetchSellerOffer(id));
  });
}

export async function deleteSellerOffer(id: string): Promise<void> {
  return withSellerSession(async () => {
    await apiClient.delete(`/seller/offers/${id}`);
  });
}

export async function fetchSellerOfferHistory(id: string): Promise<unknown[]> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<unknown[]>>(`/seller/offers/${id}/history`);
    return payload.data.data ?? [];
  });
}

export async function bulkActivateSellerOffers(offerIds: string[]): Promise<unknown> {
  return withSellerSession(async () => {
    const payload = await apiClient.post<Envelope<unknown>>('/seller/offers/bulk-activate', {
      offerIds,
    });
    return payload.data.data;
  });
}

export async function bulkPauseSellerOffers(offerIds: string[]): Promise<unknown> {
  return withSellerSession(async () => {
    const payload = await apiClient.post<Envelope<unknown>>('/seller/offers/bulk-pause', {
      offerIds,
    });
    return payload.data.data;
  });
}

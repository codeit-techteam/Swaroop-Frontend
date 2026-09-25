import {
  mapBlindSellerPurchaseRequest,
  type BlindPrInput,
} from '@/services/seller-blind-mappers';
import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success?: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

export type SellerPurchaseRequestStatus =
  | 'new'
  | 'under_review'
  | 'counter_sent'
  | 'accepted'
  | 'rejected'
  | 'expired';

export type SellerPurchaseRequest = {
  id: string;
  requestNumber: string;
  productId: string;
  productName: string;
  gradeName: string;
  category: string;
  quantityMt: number;
  unit: string;
  requestedPrice: number;
  currency: string;
  deliveryLocation: string;
  paymentTerms: string;
  notes: string;
  status: SellerPurchaseRequestStatus;
  /** Blind buyer label only — never customer legal name. */
  buyerLabel: string;
  buyerReference: string;
  receivedAt: string;
  responseDeadline: string | null;
  remainingSeconds: number | null;
  allowedActions: string[];
};

type BackendPr = BlindPrInput;

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

export function mapSellerPurchaseRequest(item: BackendPr): SellerPurchaseRequest {
  const mapped = mapBlindSellerPurchaseRequest(item);
  return {
    ...mapped,
    status: mapped.status as SellerPurchaseRequestStatus,
  };
}

export async function fetchSellerPurchaseRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<SellerPurchaseRequest[]> {
  return withSellerSession(async () => {
    const pages: SellerPurchaseRequest[] = [];
    let page = params?.page ?? 1;
    let totalPages = 1;
    const limit = params?.limit ?? 100;
    do {
      const payload = await apiClient.get<Envelope<BackendPr[]>>(
        '/seller/purchase-requests',
        {
          params: {
            page,
            limit,
            status: params?.status,
          },
        },
      );
      pages.push(...(payload.data.data ?? []).map(mapSellerPurchaseRequest));
      totalPages = payload.data.meta?.totalPages ?? 1;
      page += 1;
    } while (!params?.page && page <= totalPages && page <= 10);
    return pages;
  });
}

export async function fetchSellerPurchaseRequest(
  id: string,
): Promise<SellerPurchaseRequest> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendPr>>(
      `/seller/purchase-requests/${id}`,
    );
    const row = payload.data.data;
    if (!row) {
      throw new Error(payload.data.message ?? 'Purchase request not found');
    }
    return mapSellerPurchaseRequest(row);
  });
}

export async function fetchSellerPurchaseRequestStatus(id: string): Promise<unknown> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<unknown>>(
      `/seller/purchase-requests/${id}/status`,
    );
    return payload.data.data;
  });
}

export async function fetchSellerPurchaseRequestNegotiation(
  id: string,
): Promise<unknown> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<unknown>>(
      `/seller/purchase-requests/${id}/negotiation`,
    );
    return payload.data.data;
  });
}

export async function acceptSellerPurchaseRequest(id: string): Promise<void> {
  return withSellerSession(async () => {
    await apiClient.post(`/seller/purchase-requests/${id}/accept`);
  });
}

export async function rejectSellerPurchaseRequest(
  id: string,
  payload: { rejectionReason: string; message?: string },
): Promise<void> {
  return withSellerSession(async () => {
    await apiClient.post(`/seller/purchase-requests/${id}/reject`, payload);
  });
}

export async function counterSellerPurchaseRequest(
  id: string,
  payload: { unitPrice: number; quantity: number; note?: string },
): Promise<void> {
  return withSellerSession(async () => {
    await apiClient.post(`/seller/purchase-requests/${id}/counter-offer`, payload);
  });
}

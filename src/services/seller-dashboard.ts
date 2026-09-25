import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success: boolean;
  data: T;
};

export type SellerDashboardSummary = {
  sellerProfileId?: string;
  organizationId?: string;
  sellerStatus?: string;
  products: { active: number; inactive: number };
  offers: { active: number };
  activeOffers: number;
  inventory: { lowStockItems: number };
  documents: { pending: number; expiringSoon: number };
  purchaseRequests: {
    pending: number;
    accepted: number;
    rejected: number;
    pendingPurchaseRequests: number;
    expiringSoon: number;
    acceptedToday: number;
    rejectedToday: number;
    counterOffersPending: number;
  };
  pendingPurchaseRequests: number;
  expiringSoon: number;
  acceptedToday: number;
  rejectedToday: number;
  counterOffersPending: number;
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

export async function fetchSellerDashboardSummary(): Promise<SellerDashboardSummary> {
  return withSellerSession(async () => {
    const response = await apiClient.get<Envelope<Partial<SellerDashboardSummary>>>(
      '/seller/dashboard/summary',
    );
    const data = response.data.data ?? {};
    return {
      sellerProfileId: data.sellerProfileId,
      organizationId: data.organizationId,
      sellerStatus: data.sellerStatus,
      products: {
        active: num(data.products?.active),
        inactive: num(data.products?.inactive),
      },
      offers: { active: num(data.offers?.active ?? data.activeOffers) },
      activeOffers: num(data.activeOffers ?? data.offers?.active),
      inventory: { lowStockItems: num(data.inventory?.lowStockItems) },
      documents: {
        pending: num(data.documents?.pending),
        expiringSoon: num(data.documents?.expiringSoon),
      },
      purchaseRequests: {
        pending: num(data.purchaseRequests?.pending ?? data.pendingPurchaseRequests),
        accepted: num(data.purchaseRequests?.accepted),
        rejected: num(data.purchaseRequests?.rejected),
        pendingPurchaseRequests: num(
          data.purchaseRequests?.pendingPurchaseRequests ?? data.pendingPurchaseRequests,
        ),
        expiringSoon: num(data.purchaseRequests?.expiringSoon ?? data.expiringSoon),
        acceptedToday: num(data.purchaseRequests?.acceptedToday ?? data.acceptedToday),
        rejectedToday: num(data.purchaseRequests?.rejectedToday ?? data.rejectedToday),
        counterOffersPending: num(
          data.purchaseRequests?.counterOffersPending ?? data.counterOffersPending,
        ),
      },
      pendingPurchaseRequests: num(data.pendingPurchaseRequests),
      expiringSoon: num(data.expiringSoon),
      acceptedToday: num(data.acceptedToday),
      rejectedToday: num(data.rejectedToday),
      counterOffersPending: num(data.counterOffersPending),
    };
  });
}

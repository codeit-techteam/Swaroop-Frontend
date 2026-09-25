import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import {
  mapSellerPurchaseOrder,
} from '@/services/seller-operations';
import type {
  SellerOrder,
  SellerOrderStatus,
} from '@/seller/modules/seller-orders/types/sellerOrders';

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

export type SellerOrderSummary = {
  total: number;
  confirmed: number;
  processing: number;
  readyForDispatch: number;
  dispatched: number;
  delivered: number;
  cancelled: number;
};

export type SellerOrderTimelineEvent = {
  id?: string;
  eventType?: string;
  label?: string;
  status?: string;
  occurredAt?: string;
  at?: string;
  actorRole?: string | null;
  metadata?: unknown;
};

export type FetchSellerOrdersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type SellerOrdersPage = {
  items: SellerOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type BackendPo = Parameters<typeof mapSellerPurchaseOrder>[0] & {
  backendStatus?: string;
  unitPrice?: string | number | null;
  unit?: string;
  currency?: string;
  expectedDispatchDate?: string | null;
  expectedDispatchLabel?: string;
  payment?: {
    paymentOption?: string | null;
    paymentOptionLabel?: string;
    paymentStatus?: string;
  };
  proformaInvoice?: { status?: string; piNumber?: string } | null;
  dispatch?: {
    status?: string;
    plannedDispatchDate?: string | null;
  } | null;
  shipment?: { status?: string } | null;
  delivery?: { status?: string } | null;
  amounts?: { totalAmount?: string | number | null };
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

function toSellerApiStatus(status?: string): string | undefined {
  if (!status || status === 'all') return undefined;
  if (status === 'in_transit' || status === 'dispatch_pending') return 'DISPATCHED';
  if (status === 'accepted') return 'CONFIRMED';
  if (status === 'pending') return 'PENDING';
  if (status === 'rejected') return 'CANCELLED';
  if (status === 'delivered') return 'DELIVERED';
  return status.toUpperCase();
}

function enrichOrder(row: BackendPo): SellerOrder {
  const base = mapSellerPurchaseOrder(row);
  const payKey = (
    row.payment?.paymentStatus ??
    row.paymentStatus ??
    ''
  ).toUpperCase();

  return {
    ...base,
    // Blind buyer — displayName / reference only
    buyerName: row.buyer?.displayName ?? 'ANONYMOUS BUYER',
    buyerId: row.buyer?.reference ?? '',
    value: num(row.orderValue ?? row.amounts?.totalAmount ?? row.totalAmount, base.value),
    quantity: num(row.quantity ?? row.orderedQuantity, base.quantity),
    paymentStatus:
      payKey === 'VERIFIED' || payKey === 'PAID' || payKey === 'AUTHORIZED'
        ? 'completed'
        : base.paymentStatus,
    destination: row.deliveryRegion ?? base.destination,
  };
}

export async function fetchSellerOrdersPage(
  params: FetchSellerOrdersParams = {},
): Promise<SellerOrdersPage> {
  return withSellerSession(async () => {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'desc',
    };
    const status = toSellerApiStatus(params.status);
    if (status) query.status = status;
    if (params.search?.trim()) query.search = params.search.trim();
    if (params.from) query.from = params.from;
    if (params.to) query.to = params.to;

    const payload = await apiClient.get<Envelope<BackendPo[]>>('/seller/orders', {
      params: query,
    });
    const items = Array.isArray(payload.data.data) ? payload.data.data : [];
    const meta = payload.data.meta ?? {};
    return {
      items: items.map(enrichOrder),
      pagination: {
        page: meta.page ?? params.page ?? 1,
        limit: meta.limit ?? params.limit ?? 20,
        total: meta.total ?? items.length,
        totalPages: meta.totalPages ?? 1,
      },
    };
  });
}

export async function fetchSellerOrders(
  params: FetchSellerOrdersParams = {},
): Promise<SellerOrder[]> {
  return withSellerSession(async () => {
    if (params.page) {
      const page = await fetchSellerOrdersPage(params);
      return page.items;
    }
    const pages: SellerOrder[] = [];
    let page = 1;
    let totalPages = 1;
    const limit = params.limit ?? 50;
    do {
      const result = await fetchSellerOrdersPage({ ...params, page, limit });
      pages.push(...result.items);
      totalPages = result.pagination.totalPages;
      page += 1;
    } while (page <= totalPages && page <= 10);
    return pages;
  });
}

export async function fetchSellerOrderById(id: string): Promise<SellerOrder> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendPo>>(`/seller/orders/${id}`);
    const row = payload.data.data;
    if (!row) {
      throw new Error(payload.data.message ?? 'Order not found');
    }
    return enrichOrder(row);
  });
}

export async function fetchSellerOrderTimeline(
  id: string,
): Promise<{ poNumber: string; events: SellerOrderTimelineEvent[] }> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<
      Envelope<{
        poNumber?: string;
        purchaseOrderId?: string;
        events?: SellerOrderTimelineEvent[];
      }>
    >(`/seller/orders/${id}/timeline`);
    const data = payload.data.data ?? {};
    return {
      poNumber: data.poNumber ?? id,
      events: Array.isArray(data.events) ? data.events : [],
    };
  });
}

export async function fetchSellerOrderSummary(): Promise<SellerOrderSummary> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<Partial<SellerOrderSummary>>>(
      '/seller/orders/summary',
    );
    const data = payload.data.data ?? {};
    return {
      total: num(data.total),
      confirmed: num(data.confirmed),
      processing: num(data.processing),
      readyForDispatch: num(data.readyForDispatch),
      dispatched: num(data.dispatched),
      delivered: num(data.delivered),
      cancelled: num(data.cancelled),
    };
  });
}

export type { SellerOrder, SellerOrderStatus };

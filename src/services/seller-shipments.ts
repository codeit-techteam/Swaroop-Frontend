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

export type SellerShipmentRecord = {
  id: string;
  shipmentNumber: string;
  orderId: string;
  purchaseOrderReference: string | null;
  gradeName: string;
  quantity: number;
  unit: string;
  vehicleNumber: string;
  route: string;
  status: string;
  eta: string;
  origin: string;
  destination: string;
  buyerLabel: string;
  buyerReference: string;
  createdAt: string;
  updatedAt: string;
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function iso(value: unknown): string {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

function mapShipment(item: Record<string, unknown>): SellerShipmentRecord {
  const buyer = (item.buyer ?? {}) as {
    displayName?: string;
    reference?: string;
  };
  return {
    id: String(item.id),
    shipmentNumber: String(
      item.referenceNumber ?? item.shipmentNumber ?? item.id,
    ),
    orderId: String(
      item.purchaseOrderId ?? item.purchaseOrderReference ?? item.id,
    ),
    purchaseOrderReference: item.purchaseOrderReference
      ? String(item.purchaseOrderReference)
      : null,
    gradeName: String(
      item.gradeName ?? item.productName ?? item.referenceNumber ?? 'Shipment',
    ),
    quantity: num(item.quantity),
    unit: String(item.unit ?? 'MT'),
    vehicleNumber: String(item.vehicleNumber ?? '—'),
    route: String(item.destinationRegion ?? item.route ?? 'Assigned destination'),
    status: String(item.status ?? 'IN_TRANSIT'),
    eta: item.eta ? iso(item.eta) : iso(item.createdAt),
    origin: String(item.originWarehouseName ?? item.origin ?? 'Assigned hub'),
    destination: String(
      item.destinationRegion ?? item.destination ?? 'Assigned destination',
    ),
    buyerLabel: buyer.displayName ?? 'Anonymous Buyer',
    buyerReference: buyer.reference ?? 'BUYER-UNKNOWN',
    createdAt: iso(item.createdAt),
    updatedAt: iso(item.updatedAt ?? item.createdAt),
  };
}

export async function fetchSellerShipments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<SellerShipmentRecord[]> {
  return withSellerSession(async () => {
    const pages: SellerShipmentRecord[] = [];
    let page = params?.page ?? 1;
    let totalPages = 1;
    const limit = params?.limit ?? 100;
    do {
      const payload = await apiClient.get<Envelope<Array<Record<string, unknown>>>>(
        '/seller/shipments',
        {
          params: {
            page,
            limit,
            status: params?.status,
          },
        },
      );
      pages.push(...(payload.data.data ?? []).map(mapShipment));
      totalPages = payload.data.meta?.totalPages ?? 1;
      page += 1;
    } while (!params?.page && page <= totalPages && page <= 10);
    return pages;
  });
}

export async function fetchSellerShipment(
  id: string,
): Promise<SellerShipmentRecord> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<Record<string, unknown>>>(
      `/seller/shipments/${id}`,
    );
    const row = payload.data.data;
    if (!row) {
      throw new Error(payload.data.message ?? 'Shipment not found');
    }
    return mapShipment(row);
  });
}

import { isAxiosError } from 'axios';

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
  code?: string;
};

export type BackendDispatchStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'AWAITING_VEHICLE'
  | 'VEHICLE_ASSIGNED'
  | 'AWAITING_EWAY_BILL'
  | 'READY_FOR_DISPATCH'
  | 'LOADING'
  | 'LOADED'
  | 'DISPATCHED'
  | 'CANCELLED';

export type SellerDispatchTabFilter =
  | 'all'
  | 'ready'
  | 'scheduled'
  | 'loading'
  | 'dispatched';

export type SellerDispatchBuyer = {
  displayName: string;
  reference: string | null;
};

export type SellerDispatchSlot = {
  id: string;
  slotNumber: string | null;
  slotDate: string;
  startTime: string | null;
  endTime: string | null;
  timeSlot: string | null;
  loadingBay: string | null;
  status: string;
  label: string;
};

export type SellerDispatchEwayBill = {
  id: string;
  dispatchId: string;
  ewayBillNumber: string;
  status: string;
  generatedAt: string | null;
  validFrom: string | null;
  validUntil: string | null;
  hasDocument: boolean;
  createdAt: string;
};

export type SellerDispatchRecord = {
  id: string;
  dispatchNumber: string;
  purchaseOrderId: string;
  purchaseOrderReference: string | null;
  status: BackendDispatchStatus;
  quantity: number;
  unit: string;
  gradeName: string | null;
  plannedDispatchDate: string | null;
  actualDispatchDate: string | null;
  loadingStartedAt: string | null;
  loadingCompletedAt: string | null;
  originWarehouseId: string | null;
  loadingLocation: string | null;
  warehouseName: string | null;
  warehouseCode: string | null;
  destinationRegion: string | null;
  vehicleId: string | null;
  vehicleNumber: string | null;
  vehicleType: string | null;
  transporterName: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  vehicleSlotId: string | null;
  slot: SellerDispatchSlot | null;
  slotLabel: string | null;
  buyer: SellerDispatchBuyer;
  ewayBillNumber: string | null;
  ewayBillStatus: string | null;
  ewayBills: SellerDispatchEwayBill[];
  shipmentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SellerDispatchSummary = {
  all: number;
  readyForDispatch: number;
  scheduled: number;
  loading: number;
  dispatched: number;
  byTab: Record<SellerDispatchTabFilter, number>;
};

export type SellerDispatchListParams = {
  page?: number;
  limit?: number;
  search?: string;
  tab?: Exclude<SellerDispatchTabFilter, 'all'> | 'all';
  dispatchStatus?: BackendDispatchStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type SellerDispatchPage = {
  items: SellerDispatchRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SellerDispatchTimelineEvent = {
  id: string;
  eventType: string;
  actorRole: string | null;
  occurredAt: string;
  metadata?: unknown;
};

export type AssignDispatchVehiclePayload = {
  vehicleId: string;
  driverId?: string;
};

export type UpsertDispatchEwayPayload = {
  ewayBillNumber: string;
  validFrom?: string;
  validUntil?: string;
  documentKey?: string;
  documentId?: string;
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value);
  return s.trim() ? s : null;
}

function iso(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

async function getData<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<{ data: T; meta?: Envelope<T>['meta'] }> {
  const response = await apiClient.get<Envelope<T>>(url, { params });
  return { data: response.data.data as T, meta: response.data.meta };
}

async function postData<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<Envelope<T>>(url, body ?? {});
  return response.data.data as T;
}

function mapSlot(raw: Record<string, unknown> | null): SellerDispatchSlot | null {
  if (!raw) return null;
  return {
    id: String(raw.id),
    slotNumber: str(raw.slotNumber),
    slotDate: iso(raw.slotDate) ?? String(raw.slotDate ?? ''),
    startTime: str(raw.startTime),
    endTime: str(raw.endTime),
    timeSlot: str(raw.timeSlot),
    loadingBay: str(raw.loadingBay),
    status: String(raw.status ?? ''),
    label: String(raw.label ?? ''),
  };
}

function mapEway(raw: Record<string, unknown>): SellerDispatchEwayBill {
  return {
    id: String(raw.id),
    dispatchId: String(raw.dispatchId),
    ewayBillNumber: String(raw.ewayBillNumber ?? ''),
    status: String(raw.status ?? ''),
    generatedAt: iso(raw.generatedAt),
    validFrom: iso(raw.validFrom),
    validUntil: iso(raw.validUntil),
    hasDocument: Boolean(raw.hasDocument),
    createdAt: iso(raw.createdAt) ?? new Date().toISOString(),
  };
}

export function mapSellerDispatch(row: Record<string, unknown>): SellerDispatchRecord {
  const buyer = row.buyer as
    | { displayName?: string; reference?: string }
    | null
    | undefined;
  const ewayBills = Array.isArray(row.ewayBills)
    ? row.ewayBills.map((item) => mapEway(item as Record<string, unknown>))
    : [];

  return {
    id: String(row.id),
    dispatchNumber: String(row.dispatchNumber ?? ''),
    purchaseOrderId: String(row.purchaseOrderId ?? ''),
    purchaseOrderReference: str(row.purchaseOrderReference),
    status: String(row.status ?? 'AWAITING_VEHICLE') as BackendDispatchStatus,
    quantity: num(row.quantity),
    unit: String(row.unit ?? 'MT'),
    gradeName: str(row.gradeName),
    plannedDispatchDate: iso(row.plannedDispatchDate),
    actualDispatchDate: iso(row.actualDispatchDate),
    loadingStartedAt: iso(row.loadingStartedAt),
    loadingCompletedAt: iso(row.loadingCompletedAt),
    originWarehouseId: str(row.originWarehouseId),
    loadingLocation: str(row.loadingLocation),
    warehouseName: str(row.warehouseName),
    warehouseCode: str(row.warehouseCode),
    destinationRegion: str(row.destinationRegion),
    vehicleId: str(row.vehicleId),
    vehicleNumber: str(row.vehicleNumber),
    vehicleType: str(row.vehicleType),
    transporterName: str(row.transporterName),
    driverId: str(row.driverId),
    driverName: str(row.driverName),
    driverPhone: str(row.driverPhone),
    vehicleSlotId: str(row.vehicleSlotId),
    slot: mapSlot((row.slot as Record<string, unknown> | null) ?? null),
    slotLabel: str(row.slotLabel),
    buyer: {
      displayName: buyer?.displayName ?? 'Anonymous Buyer',
      reference: buyer?.reference ?? null,
    },
    ewayBillNumber: str(row.ewayBillNumber) ?? ewayBills[0]?.ewayBillNumber ?? null,
    ewayBillStatus: str(row.ewayBillStatus) ?? ewayBills[0]?.status ?? null,
    ewayBills,
    shipmentId: str(row.shipmentId),
    createdAt: iso(row.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(row.updatedAt) ?? new Date().toISOString(),
  };
}

export function dispatchApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; code?: string; error?: string }
      | undefined;
    const status = error.response?.status;
    if (status === 401) return 'Session expired. Please sign in again.';
    if (status === 403) return 'You are not authorized for this dispatch.';
    if (status === 404) return 'Dispatch not found.';
    if (status === 409) {
      return (
        data?.message ?? 'Dispatch state changed. Refresh and try again.'
      );
    }
    if (status === 422) {
      return data?.message ?? 'Business validation failed.';
    }
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (typeof data?.code === 'string' && data.code.trim()) {
      return data.code.replace(/_/g, ' ');
    }
    if (status && status >= 500) return 'Server error. Please retry.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Unable to complete dispatch request.';
}

export async function fetchSellerDispatchesPage(
  params: SellerDispatchListParams = {},
): Promise<SellerDispatchPage> {
  return withSellerSession(async () => {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'desc',
    };
    if (params.search?.trim()) query.search = params.search.trim();
    if (params.tab && params.tab !== 'all') query.tab = params.tab;
    if (params.dispatchStatus) query.dispatchStatus = params.dispatchStatus;

    const { data, meta } = await getData<Array<Record<string, unknown>>>(
      '/seller/dispatches',
      query,
    );
    const total = meta?.total ?? (Array.isArray(data) ? data.length : 0);
    const limit = meta?.limit ?? params.limit ?? 20;
    const page = meta?.page ?? params.page ?? 1;
    return {
      items: (Array.isArray(data) ? data : []).map(mapSellerDispatch),
      pagination: {
        page,
        limit,
        total,
        totalPages: meta?.totalPages ?? Math.max(1, Math.ceil(total / limit)),
      },
    };
  });
}

export async function fetchSellerDispatchSummary(): Promise<SellerDispatchSummary> {
  return withSellerSession(async () => {
    const { data } = await getData<Partial<SellerDispatchSummary>>(
      '/seller/dispatches/summary',
    );
    const all = num(data.all);
    const readyForDispatch = num(data.readyForDispatch);
    const scheduled = num(data.scheduled);
    const loading = num(data.loading);
    const dispatched = num(data.dispatched);
    return {
      all,
      readyForDispatch,
      scheduled,
      loading,
      dispatched,
      byTab: {
        all: num(data.byTab?.all, all),
        ready: num(data.byTab?.ready, readyForDispatch),
        scheduled: num(data.byTab?.scheduled, scheduled),
        loading: num(data.byTab?.loading, loading),
        dispatched: num(data.byTab?.dispatched, dispatched),
      },
    };
  });
}

export async function fetchSellerDispatch(id: string): Promise<SellerDispatchRecord> {
  return withSellerSession(async () => {
    const { data } = await getData<Record<string, unknown>>(`/seller/dispatches/${id}`);
    return mapSellerDispatch(data);
  });
}

export async function fetchSellerDispatchTimeline(
  id: string,
): Promise<SellerDispatchTimelineEvent[]> {
  return withSellerSession(async () => {
    const { data } = await getData<Array<Record<string, unknown>>>(
      `/seller/dispatches/${id}/timeline`,
    );
    return (Array.isArray(data) ? data : []).map((row) => ({
      id: String(row.id),
      eventType: String(row.eventType ?? ''),
      actorRole: str(row.actorRole),
      occurredAt: iso(row.occurredAt) ?? new Date().toISOString(),
      metadata: row.metadata,
    }));
  });
}

export async function assignDispatchVehicle(
  id: string,
  payload: AssignDispatchVehiclePayload,
): Promise<SellerDispatchRecord> {
  return withSellerSession(async () => {
    const data = await postData<Record<string, unknown>>(
      `/seller/dispatches/${id}/assign-vehicle`,
      payload,
    );
    return mapSellerDispatch(data);
  });
}

export async function upsertDispatchEwayBill(
  id: string,
  payload: UpsertDispatchEwayPayload,
): Promise<SellerDispatchEwayBill> {
  return withSellerSession(async () => {
    const data = await postData<Record<string, unknown>>(
      `/seller/dispatches/${id}/eway-bill`,
      payload,
    );
    return mapEway(data);
  });
}

export async function startDispatchLoading(id: string): Promise<SellerDispatchRecord> {
  return withSellerSession(async () => {
    const data = await postData<Record<string, unknown>>(
      `/seller/dispatches/${id}/start-loading`,
    );
    return mapSellerDispatch(data);
  });
}

export async function completeDispatchLoading(
  id: string,
): Promise<SellerDispatchRecord> {
  return withSellerSession(async () => {
    const data = await postData<Record<string, unknown>>(
      `/seller/dispatches/${id}/complete-loading`,
    );
    return mapSellerDispatch(data);
  });
}

export async function markDispatchReady(id: string): Promise<SellerDispatchRecord> {
  return withSellerSession(async () => {
    const data = await postData<Record<string, unknown>>(
      `/seller/dispatches/${id}/mark-ready`,
    );
    return mapSellerDispatch(data);
  });
}

export async function executeSellerDispatch(id: string): Promise<{
  dispatch: SellerDispatchRecord;
}> {
  return withSellerSession(async () => {
    const data = await postData<{
      dispatch?: Record<string, unknown>;
    }>(`/seller/dispatches/${id}/dispatch`);
    return {
      dispatch: mapSellerDispatch(
        (data.dispatch ?? data) as Record<string, unknown>,
      ),
    };
  });
}

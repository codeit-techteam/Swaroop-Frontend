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

export type VehicleSlotStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'CHECKED_IN'
  | 'LOADING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'MISSED';

export type SellerVehicleSlot = {
  id: string;
  slotNumber: string | null;
  warehouseId: string;
  warehouseName: string | null;
  warehouseCode: string | null;
  warehouseCity: string | null;
  dispatchId: string | null;
  dispatchNumber: string | null;
  orderId: string | null;
  purchaseOrderReference: string | null;
  vehicleId: string | null;
  vehicleNumber: string | null;
  vehicleType: string | null;
  carrier: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  shipmentId: string | null;
  shipmentNumber: string | null;
  slotDate: string;
  startTime: string | null;
  endTime: string | null;
  timeSlot: string | null;
  loadingBay: string | null;
  status: VehicleSlotStatus;
  quantityMt: string | number | null;
  unit: string;
  destinationRegion: string | null;
  buyer: { displayName: string; reference?: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export type VehicleSlotSummary = {
  date: string;
  today: {
    total: number;
    booked: number;
    available: number;
    completed: number;
    cancelled: number;
  };
};

export type VehicleSlotListParams = {
  page?: number;
  limit?: number;
  status?: string;
  warehouseId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  vehicleType?: string;
  carrier?: string;
  orderId?: string;
  dispatchId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type VehicleSlotPage = {
  items: SellerVehicleSlot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BookVehicleSlotPayload = {
  warehouseId: string;
  slotDate: string;
  timeSlot?: string;
  startTime?: string;
  endTime?: string;
  loadingBay?: string;
  dispatchId?: string;
  vehicleId?: string;
  driverId?: string;
  quantityMt?: number;
  notes?: string;
};

function num(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function dateOnly(value: unknown): string {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
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

function mapSlot(row: Record<string, unknown>): SellerVehicleSlot {
  const buyer = row.buyer as { displayName?: string; reference?: string } | null;
  return {
    id: String(row.id),
    slotNumber: row.slotNumber != null ? String(row.slotNumber) : null,
    warehouseId: String(row.warehouseId ?? ''),
    warehouseName: row.warehouseName != null ? String(row.warehouseName) : null,
    warehouseCode: row.warehouseCode != null ? String(row.warehouseCode) : null,
    warehouseCity: row.warehouseCity != null ? String(row.warehouseCity) : null,
    dispatchId: row.dispatchId != null ? String(row.dispatchId) : null,
    dispatchNumber: row.dispatchNumber != null ? String(row.dispatchNumber) : null,
    orderId: row.orderId != null ? String(row.orderId) : null,
    purchaseOrderReference:
      row.purchaseOrderReference != null ? String(row.purchaseOrderReference) : null,
    vehicleId: row.vehicleId != null ? String(row.vehicleId) : null,
    vehicleNumber: row.vehicleNumber != null ? String(row.vehicleNumber) : null,
    vehicleType: row.vehicleType != null ? String(row.vehicleType) : null,
    carrier: row.carrier != null ? String(row.carrier) : null,
    driverId: row.driverId != null ? String(row.driverId) : null,
    driverName: row.driverName != null ? String(row.driverName) : null,
    driverPhone: row.driverPhone != null ? String(row.driverPhone) : null,
    shipmentId: row.shipmentId != null ? String(row.shipmentId) : null,
    shipmentNumber: row.shipmentNumber != null ? String(row.shipmentNumber) : null,
    slotDate: dateOnly(row.slotDate),
    startTime: row.startTime != null ? String(row.startTime) : null,
    endTime: row.endTime != null ? String(row.endTime) : null,
    timeSlot: row.timeSlot != null ? String(row.timeSlot) : null,
    loadingBay: row.loadingBay != null ? String(row.loadingBay) : null,
    status: String(row.status ?? 'REQUESTED') as VehicleSlotStatus,
    quantityMt: (row.quantityMt as string | number | null) ?? null,
    unit: String(row.unit ?? 'MT'),
    destinationRegion:
      row.destinationRegion != null ? String(row.destinationRegion) : null,
    buyer: buyer
      ? {
          displayName: buyer.displayName ?? 'Anonymous Buyer',
          reference: buyer.reference ?? null,
        }
      : { displayName: 'Anonymous Buyer' },
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? new Date().toISOString()),
  };
}

export function vehicleSlotApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string | string[];
          code?: string;
          error?: { message?: string; code?: string };
        }
      | undefined;
    const code = data?.code ?? data?.error?.code;
    const message = data?.message ?? data?.error?.message;

    if (code === 'VEHICLE_SLOT_UNAVAILABLE') {
      return typeof message === 'string' && message
        ? message
        : 'This slot is no longer available. Please select another slot.';
    }
    if (code === 'PAYMENT_NOT_CLEARED') {
      return 'Vehicle slot booking is not available until payment is cleared.';
    }
    if (error.response?.status === 401) {
      return 'Session expired. Please sign in again.';
    }
    if (error.response?.status === 404) {
      return 'Requested order, vehicle, or slot was not found.';
    }
    if (error.response?.status === 409) {
      return typeof message === 'string' && message
        ? message
        : 'This slot is no longer available. Please select another slot.';
    }
    if (typeof message === 'string' && message) return message;
    if (Array.isArray(message) && message[0]) return String(message[0]);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function fetchVehicleSlotSummary(
  date?: string,
): Promise<VehicleSlotSummary> {
  return withSellerSession(async () => {
    const { data } = await getData<VehicleSlotSummary>(
      '/seller/vehicle-slots/summary',
      date ? { date } : undefined,
    );
    return {
      date: dateOnly(data.date) || date || '',
      today: {
        total: num(data.today?.total),
        booked: num(data.today?.booked),
        available: num(data.today?.available),
        completed: num(data.today?.completed),
        cancelled: num(data.today?.cancelled),
      },
    };
  });
}

export async function fetchVehicleSlotsPage(
  params: VehicleSlotListParams = {},
): Promise<VehicleSlotPage> {
  return withSellerSession(async () => {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sortBy: params.sortBy ?? 'slotDate',
      sortOrder: params.sortOrder ?? 'desc',
    };
    if (params.status && params.status !== 'all') query.status = params.status;
    if (params.warehouseId && params.warehouseId !== 'all') {
      query.warehouseId = params.warehouseId;
    }
    if (params.date) query.date = params.date;
    if (params.dateFrom) query.dateFrom = params.dateFrom;
    if (params.dateTo) query.dateTo = params.dateTo;
    if (params.vehicleType && params.vehicleType !== 'all') {
      query.vehicleType = params.vehicleType;
    }
    if (params.carrier && params.carrier !== 'all') query.carrier = params.carrier;
    if (params.orderId) query.orderId = params.orderId;
    if (params.dispatchId) query.dispatchId = params.dispatchId;
    if (params.search?.trim()) query.search = params.search.trim();

    const { data, meta } = await getData<Array<Record<string, unknown>>>(
      '/seller/vehicle-slots',
      query,
    );
    const page = num(meta?.page, params.page ?? 1);
    const limit = num(meta?.limit, params.limit ?? 20);
    const total = num(meta?.total, Array.isArray(data) ? data.length : 0);
    return {
      items: (Array.isArray(data) ? data : []).map(mapSlot),
      pagination: {
        page,
        limit,
        total,
        totalPages: num(meta?.totalPages, Math.max(1, Math.ceil(total / limit))),
      },
    };
  });
}

export async function fetchVehicleSlotById(id: string): Promise<SellerVehicleSlot> {
  return withSellerSession(async () => {
    const { data } = await getData<Record<string, unknown>>(
      `/seller/vehicle-slots/${id}`,
    );
    return mapSlot(data);
  });
}

export async function bookVehicleSlot(
  payload: BookVehicleSlotPayload,
): Promise<SellerVehicleSlot> {
  return withSellerSession(async () => {
    const response = await apiClient.post<Envelope<Record<string, unknown>>>(
      '/seller/vehicle-slots',
      payload,
    );
    return mapSlot(response.data.data);
  });
}

export async function cancelVehicleSlot(id: string): Promise<SellerVehicleSlot> {
  return withSellerSession(async () => {
    const response = await apiClient.post<Envelope<Record<string, unknown>>>(
      `/seller/vehicle-slots/${id}/cancel`,
    );
    return mapSlot(response.data.data);
  });
}

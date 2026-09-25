import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import {
  buildInventoryProduct,
  buildInventorySummary,
  INVENTORY_WAREHOUSES,
} from '@/seller/services/inventoryService';
import type {
  InventoryCategory,
  InventoryProduct,
  InventoryStatus,
  InventorySummary,
  WarehouseOption,
} from '@/seller/types';

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

type BackendInventoryRow = {
  id: string;
  productId: string;
  gradeId?: string | null;
  gradeName?: string;
  gradeCode?: string;
  category?: string;
  warehouse?: {
    id: string;
    code?: string;
    name: string;
    city?: string | null;
    state?: string | null;
  } | null;
  onHandQuantity?: number | string;
  sellableQuantity?: number | string;
  availableQty?: number | string;
  reservedQty?: number | string;
  allocatedQty?: number | string;
  unit?: string;
  minimumOrderQuantity?: number | string | null;
  lowStockThreshold?: number | string | null;
  stockStatus?: string;
  status?: string;
  offerId?: string | null;
  updatedAt?: string;
  createdAt?: string;
  product?: {
    id?: string;
    code?: string;
    name?: string;
    brand?: string | null;
    manufacturer?: string | null;
    gradeId?: string;
    unit?: string;
    status?: string;
    grade?: {
      id?: string;
      code?: string;
      name?: string;
      category?: { name?: string; code?: string } | null;
    } | null;
  };
};

type BackendSummary = {
  onHand?: { quantity?: number | string; unit?: string };
  sellable?: { quantity?: number | string; unit?: string };
  activeProducts?: number;
  lowStock?: number;
  outOfStock?: number;
  warehouses?: number;
  skuCount?: number;
  totalAvailable?: number;
  totalReserved?: number;
  totalAllocated?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  unit?: string;
};

type BackendMovement = {
  id: string;
  inventoryId?: string;
  productId?: string;
  productName?: string;
  productCode?: string;
  warehouseId?: string | null;
  warehouseName?: string | null;
  warehouseCity?: string | null;
  type?: string;
  quantity?: number | string;
  quantityDelta?: number | string;
  unit?: string;
  notes?: string | null;
  timestamp?: string;
};

type BackendWarehouse = {
  id: string;
  code?: string;
  name: string;
  city?: string | null;
  state?: string | null;
  onHand?: number;
  sellable?: number;
  grades?: number;
};

export type InventoryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
  stockStatus?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type InventoryApiSummary = {
  onHand: number;
  sellable: number;
  activeProducts: number;
  lowStock: number;
  outOfStock: number;
  warehouses: number;
  skuCount: number;
  unit: string;
};

export type InventoryWarehouse = {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  onHand: number;
  sellable: number;
  grades: number;
};

export type LatestStockMovement = {
  id: string;
  inventoryId: string;
  productId: string;
  productName: string;
  productCode: string;
  warehouseName: string | null;
  warehouseCity: string | null;
  type: string;
  quantity: number;
  quantityDelta: number;
  unit: string;
  notes: string | null;
  timestamp: string;
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

function mapWarehouseOption(name?: string | null): WarehouseOption {
  const trimmed = (name ?? '').trim();
  if (INVENTORY_WAREHOUSES.includes(trimmed as WarehouseOption)) {
    return trimmed as WarehouseOption;
  }
  return 'Main Warehouse';
}

function mapCategory(raw?: string): InventoryCategory {
  const key = (raw ?? '').toLowerCase();
  if (key.includes('chem')) return 'Chemicals';
  if (key.includes('special')) return 'Speciality';
  if (key.includes('lubr')) return 'Lubricants';
  return 'Polymer';
}

function mapStockStatus(
  status: string | undefined,
  remaining: number,
  threshold: number | null,
): InventoryStatus {
  const key = (status ?? '').toUpperCase();
  if (key === 'OUT_OF_STOCK' || remaining <= 0) return 'out_of_stock';
  if (key === 'LOW' || key === 'LOW_STOCK') return 'low_stock';
  if (threshold != null && remaining <= threshold) return 'low_stock';
  if (remaining <= 10) return 'low_stock';
  return 'normal';
}

export function mapInventoryRowToMobile(row: BackendInventoryRow): InventoryProduct {
  const sellable = num(row.sellableQuantity ?? row.availableQty);
  const reserved = num(row.reservedQty);
  const offered = num(row.allocatedQty);
  const onHand = num(row.onHandQuantity ?? sellable + reserved);
  const threshold =
    row.lowStockThreshold == null || row.lowStockThreshold === ''
      ? null
      : num(row.lowStockThreshold);
  const remainingPreview = Math.max(0, onHand - reserved - offered);

  const productName =
    row.product?.name ?? row.gradeName ?? row.product?.code ?? 'Inventory item';
  const grade =
    row.gradeCode ?? row.product?.grade?.code ?? row.product?.code ?? row.gradeName ?? '—';
  const categoryName =
    row.category ??
    row.product?.grade?.category?.name ??
    row.product?.grade?.name ??
    'Grade';

  const product = buildInventoryProduct(
    {
      id: row.id,
      sellerProductId: row.productId ?? row.product?.id,
      productName,
      grade,
      brand: row.product?.manufacturer ?? row.product?.brand ?? 'PRIVATE',
      category: mapCategory(categoryName),
      subcategory: categoryName,
      warehouse: mapWarehouseOption(row.warehouse?.name),
      activeOffer: Boolean(row.offerId),
      availableStock: onHand,
      reservedStock: reserved,
      offeredStock: offered,
    },
    row.updatedAt ?? row.createdAt ?? new Date().toISOString(),
  );

  // Prefer backend stockStatus when present; otherwise keep computed status.
  const backendStatus = row.stockStatus ?? row.status;
  if (backendStatus) {
    return {
      ...product,
      status: mapStockStatus(backendStatus, remainingPreview, threshold),
    };
  }
  return product;
}

function mapSummary(data: BackendSummary): InventoryApiSummary {
  const unit = data.onHand?.unit ?? data.sellable?.unit ?? data.unit ?? 'MT';
  return {
    onHand: num(data.onHand?.quantity ?? data.totalAvailable),
    sellable: num(data.sellable?.quantity ?? data.totalAvailable),
    activeProducts: num(data.activeProducts ?? data.skuCount),
    lowStock: num(data.lowStock ?? data.lowStockCount),
    outOfStock: num(data.outOfStock ?? data.outOfStockCount),
    warehouses: num(data.warehouses),
    skuCount: num(data.skuCount),
    unit,
  };
}

export function toMobileInventorySummary(
  products: InventoryProduct[],
  apiSummary?: InventoryApiSummary | null,
): InventorySummary {
  if (!apiSummary) {
    return buildInventorySummary(products);
  }
  return {
    totalProducts: apiSummary.activeProducts || products.length,
    activeOffers: products.filter((p) => p.activeOffer).length,
    lowStock: apiSummary.lowStock,
    outOfStock: apiSummary.outOfStock,
  };
}

export async function fetchInventorySummary(): Promise<InventoryApiSummary> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendSummary>>(
      '/seller/inventory/summary',
    );
    return mapSummary(payload.data.data ?? {});
  });
}

export async function fetchSellerInventory(
  params: InventoryListParams = {},
): Promise<{
  items: InventoryProduct[];
  meta: NonNullable<Envelope<unknown>['meta']>;
}> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendInventoryRow[]>>(
      '/seller/inventory',
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 50,
          search: params.search || undefined,
          warehouseId: params.warehouseId || undefined,
          stockStatus: params.stockStatus || undefined,
          status: params.status || undefined,
          sortBy: params.sortBy ?? 'updatedAt',
          sortOrder: params.sortOrder ?? 'desc',
        },
      },
    );
    return {
      items: (payload.data.data ?? []).map(mapInventoryRowToMobile),
      meta: payload.data.meta ?? {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        total: 0,
        totalPages: 1,
      },
    };
  });
}

export async function fetchLowStockInventory(limit = 8): Promise<InventoryProduct[]> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendInventoryRow[]>>(
      '/seller/inventory/low-stock',
      { params: { page: 1, limit } },
    );
    return (payload.data.data ?? []).map(mapInventoryRowToMobile);
  });
}

export async function fetchLatestInventoryMovements(
  limit = 1,
): Promise<LatestStockMovement[]> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendMovement[]>>(
      '/seller/inventory/movements/latest',
      { params: { limit } },
    );
    return (payload.data.data ?? []).map((item) => ({
      id: item.id,
      inventoryId: item.inventoryId ?? '',
      productId: item.productId ?? '',
      productName: item.productName ?? 'Inventory',
      productCode: item.productCode ?? '',
      warehouseName: item.warehouseName ?? null,
      warehouseCity: item.warehouseCity ?? null,
      type: item.type ?? 'ADJUSTMENT',
      quantity: num(item.quantity),
      quantityDelta: num(item.quantityDelta ?? item.quantity),
      unit: item.unit ?? 'MT',
      notes: item.notes ?? null,
      timestamp: item.timestamp ?? new Date().toISOString(),
    }));
  });
}

export async function fetchSellerInventoryWarehouses(): Promise<InventoryWarehouse[]> {
  return withSellerSession(async () => {
    const payload = await apiClient.get<Envelope<BackendWarehouse[]>>(
      '/seller/inventory/warehouses',
    );
    return (payload.data.data ?? []).map((item) => ({
      id: item.id,
      code: item.code ?? '',
      name: item.name,
      city: item.city ?? '',
      state: item.state ?? '',
      onHand: num(item.onHand),
      sellable: num(item.sellable),
      grades: num(item.grades),
    }));
  });
}

export async function adjustSellerInventoryStock(input: {
  inventoryId: string;
  quantityDelta: number;
  notes?: string;
  type?: string;
}): Promise<unknown> {
  return withSellerSession(async () => {
    const payload = await apiClient.post(
      `/seller/inventory/${input.inventoryId}/adjust`,
      {
        quantityDelta: input.quantityDelta,
        type: input.type ?? 'ADJUSTMENT',
        notes: input.notes ?? 'Stock adjustment from seller app',
      },
    );
    return (payload.data as Envelope<unknown>).data;
  });
}

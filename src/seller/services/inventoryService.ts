import { STORAGE_KEYS } from '@/constants';
import { catalogParentToInventoryCategory } from '@/seller/utils/catalog';
import type {
  InventoryProduct,
  InventorySnapshot,
  InventoryStatus,
  InventorySummary,
  InventoryUpdateInput,
  SellerProduct,
  StockHistoryEntry,
  WarehouseOption,
} from '@/seller/types';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type InventorySeedProduct = Omit<InventoryProduct, 'remainingStock' | 'status' | 'updatedAt'>;
type InventorySeedHistory = Omit<StockHistoryEntry, 'warehouse' | 'reason'> & {
  warehouse: WarehouseOption;
  reason: StockHistoryEntry['reason'];
};

type InventorySeed = {
  products: InventorySeedProduct[];
  stockHistory: InventorySeedHistory[];
};

const inventorySeed = require('@/seller/mock/inventory.json') as InventorySeed;

export const INVENTORY_WAREHOUSES: WarehouseOption[] = [
  'Main Warehouse',
  'Hazira',
  'JNPT',
  'Bhiwandi',
  'Mundra',
];

const LOW_STOCK_THRESHOLD = 10;

const safeParse = <T>(value: string | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const roundStock = (value: number): number => Math.round(value * 100) / 100;

const resolveStatus = (remainingStock: number): InventoryStatus => {
  if (remainingStock <= 0) {
    return 'out_of_stock';
  }
  if (remainingStock <= LOW_STOCK_THRESHOLD) {
    return 'low_stock';
  }
  return 'normal';
};

export const buildInventoryProduct = (
  product: InventorySeedProduct | InventoryProduct,
  updatedAt?: string,
): InventoryProduct => {
  const remainingStock = roundStock(
    Number(product.availableStock) - Number(product.reservedStock) - Number(product.offeredStock),
  );

  return {
    ...product,
    remainingStock,
    status: resolveStatus(remainingStock),
    updatedAt: updatedAt ?? ('updatedAt' in product ? product.updatedAt : new Date().toISOString()),
  };
};

export const buildInventorySummary = (products: InventoryProduct[]): InventorySummary => ({
  totalProducts: products.length,
  activeOffers: products.filter((product) => product.activeOffer).length,
  lowStock: products.filter((product) => product.status === 'low_stock').length,
  outOfStock: products.filter((product) => product.status === 'out_of_stock').length,
});

const sortByUpdatedAt = <T extends { updatedAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

const mergeSellerProductsIntoInventory = (
  products: InventoryProduct[],
  sellerProducts: SellerProduct[],
): InventoryProduct[] => {
  const linkedIds = new Set(products.map((item) => item.sellerProductId).filter(Boolean));

  const merged = [...products];

  sellerProducts.forEach((sellerProduct) => {
    const productStock = Number(sellerProduct.form.availableQty || '0');
    const matchedByLink = sellerProduct.id;
    const existingIndex = merged.findIndex(
      (item) =>
        item.sellerProductId === matchedByLink ||
        (!item.sellerProductId &&
          item.productName === sellerProduct.form.name &&
          item.grade === sellerProduct.form.grade),
    );

    if (existingIndex >= 0) {
      const existing = merged[existingIndex];
      merged[existingIndex] = buildInventoryProduct(
        {
          ...existing,
          sellerProductId: sellerProduct.id,
          productName: sellerProduct.form.name,
          grade: sellerProduct.form.grade,
          brand: sellerProduct.form.brand,
          warehouse: INVENTORY_WAREHOUSES.includes(
            sellerProduct.form.warehouseLocation as WarehouseOption,
          )
            ? (sellerProduct.form.warehouseLocation as WarehouseOption)
            : existing.warehouse,
          availableStock: Number.isFinite(productStock) ? productStock : existing.availableStock,
        },
        sellerProduct.updatedAt,
      );
      linkedIds.add(sellerProduct.id);
      return;
    }

    if (!linkedIds.has(sellerProduct.id)) {
      merged.unshift(
        buildInventoryProduct(
          {
            id: `inventory-${sellerProduct.id}`,
            sellerProductId: sellerProduct.id,
            productName: sellerProduct.form.name,
            grade: sellerProduct.form.grade,
            brand: sellerProduct.form.brand,
            category: catalogParentToInventoryCategory(sellerProduct.form.category),
            subcategory: sellerProduct.form.category,
            warehouse: 'Main Warehouse',
            activeOffer: sellerProduct.status === 'published',
            availableStock: Number.isFinite(productStock) ? productStock : 0,
            reservedStock: 0,
            offeredStock: 0,
          },
          sellerProduct.updatedAt,
        ),
      );
    }
  });

  return sortByUpdatedAt(merged);
};

export const buildDefaultInventorySnapshot = (sellerProducts: SellerProduct[] = []): InventorySnapshot => {
  const products = mergeSellerProductsIntoInventory(
    inventorySeed.products.map((product) => buildInventoryProduct(product)),
    sellerProducts,
  );

  return {
    products,
    warehouses: [...INVENTORY_WAREHOUSES],
    inventorySummary: buildInventorySummary(products),
    selectedProductId: products[0]?.id ?? null,
    stockHistory: sortByUpdatedAt(inventorySeed.stockHistory),
  };
};

export const getSummary = (products: InventoryProduct[]): InventorySummary =>
  buildInventorySummary(products);

export const getInventory = (sellerProducts: SellerProduct[] = []): InventorySnapshot => {
  const fallback = buildDefaultInventorySnapshot(sellerProducts);
  const parsed = safeParse<InventorySnapshot>(
    getStorageItem(STORAGE_KEYS.SELLER_INVENTORY_STATE),
    fallback,
  );

  const products = mergeSellerProductsIntoInventory(
    parsed.products.map((product) => buildInventoryProduct(product, product.updatedAt)),
    sellerProducts,
  );

  return {
    ...parsed,
    products,
    warehouses: parsed.warehouses?.length ? parsed.warehouses : [...INVENTORY_WAREHOUSES],
    inventorySummary: buildInventorySummary(products),
    selectedProductId:
      parsed.selectedProductId && products.some((product) => product.id === parsed.selectedProductId)
        ? parsed.selectedProductId
        : products[0]?.id ?? null,
    stockHistory: sortByUpdatedAt(parsed.stockHistory ?? fallback.stockHistory),
  };
};

export const persistInventory = (snapshot: InventorySnapshot): void => {
  setStorageItem(STORAGE_KEYS.SELLER_INVENTORY_STATE, JSON.stringify(snapshot));
};

export const updateStock = (
  snapshot: InventorySnapshot,
  input: InventoryUpdateInput,
): { snapshot: InventorySnapshot; historyEntry: StockHistoryEntry | null } => {
  const target = snapshot.products.find((product) => product.id === input.productId);
  if (!target) {
    return { snapshot, historyEntry: null };
  }

  const oldStock = target.availableStock;
  const nextAvailableStock = roundStock(
    Math.max(0, oldStock + Number(input.addStock || 0) - Number(input.reduceStock || 0)),
  );

  const updatedProduct = buildInventoryProduct(
    {
      ...target,
      warehouse: input.warehouse,
      availableStock: nextAvailableStock,
    },
    new Date().toISOString(),
  );

  const historyEntry: StockHistoryEntry = {
    id: `history-${Date.now()}`,
    productId: target.id,
    productName: target.productName,
    warehouse: input.warehouse,
    added: roundStock(Number(input.addStock || 0)),
    reduced: roundStock(Number(input.reduceStock || 0)),
    reason: input.reason,
    updatedBy: input.updatedBy,
    updatedAt: updatedProduct.updatedAt,
    oldStock,
    newStock: nextAvailableStock,
  };

  const products = sortByUpdatedAt(
    snapshot.products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
  );

  return {
    historyEntry,
    snapshot: {
      ...snapshot,
      products,
      inventorySummary: buildInventorySummary(products),
      selectedProductId: updatedProduct.id,
      stockHistory: sortByUpdatedAt([historyEntry, ...snapshot.stockHistory]),
    },
  };
};

export const reserveStockForOrder = (
  snapshot: InventorySnapshot,
  productId: string,
  quantityMt: number,
): { snapshot: InventorySnapshot; reserved: boolean } => {
  const target = snapshot.products.find((product) => product.id === productId);
  if (!target) {
    return { snapshot, reserved: false };
  }

  const remainingStock = roundStock(
    Number(target.availableStock) - Number(target.reservedStock) - Number(target.offeredStock),
  );

  if (remainingStock < quantityMt) {
    return { snapshot, reserved: false };
  }

  const updatedProduct = buildInventoryProduct(
    {
      ...target,
      reservedStock: roundStock(Number(target.reservedStock) + quantityMt),
    },
    new Date().toISOString(),
  );

  const products = sortByUpdatedAt(
    snapshot.products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
  );

  return {
    reserved: true,
    snapshot: {
      ...snapshot,
      products,
      inventorySummary: buildInventorySummary(products),
    },
  };
};

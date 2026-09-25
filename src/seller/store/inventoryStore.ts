import { create } from 'zustand';

import {
  getInventory,
  INVENTORY_WAREHOUSES,
  persistInventory,
  reserveStockForOrder as applyReserveStockForOrder,
  updateStock as applyInventoryUpdate,
} from '@/seller/services/inventoryService';
import type { InventoryStore } from '@/seller/types';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import {
  fetchInventorySummary,
  fetchSellerInventory,
  toMobileInventorySummary,
} from '@/services/seller-inventory';
import { adjustSellerInventory } from '@/services/seller-products';
import { logger } from '@/utils/logger';

const syncOfferStock = (): void => {
  useSellerOffersStore.getState().syncInventoryFromCatalog();
};

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  ...getInventory(useSellerProductStore.getState().products),
  isHydrated: false,

  hydrateInventoryState: () => {
    set({
      ...getInventory(useSellerProductStore.getState().products),
      isHydrated: true,
    });
    syncOfferStock();
  },

  hydrateFromApi: async () => {
    try {
      const [{ items }, apiSummary] = await Promise.all([
        fetchSellerInventory({ page: 1, limit: 100 }),
        fetchInventorySummary().catch(() => null),
      ]);
      const snapshot = {
        products: items,
        warehouses: [...INVENTORY_WAREHOUSES],
        inventorySummary: toMobileInventorySummary(items, apiSummary),
        selectedProductId: get().selectedProductId,
        stockHistory: get().stockHistory,
      };
      set({
        ...snapshot,
        isHydrated: true,
      });
      persistInventory(snapshot);
      syncOfferStock();
    } catch (error) {
      logger.warn('Seller inventory API hydrate failed; keeping local snapshot', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      set({
        ...getInventory(useSellerProductStore.getState().products),
        isHydrated: true,
      });
      syncOfferStock();
    }
  },

  refreshFromApi: async () => {
    await get().hydrateFromApi();
  },

  selectProduct: (productId) => {
    set({ selectedProductId: productId });
    persistInventory(get());
  },

  refreshInventoryCatalog: () => {
    const snapshot = getInventory(useSellerProductStore.getState().products);
    set(snapshot);
    persistInventory(snapshot);
  },

  updateStock: (input) => {
    const result = applyInventoryUpdate(get(), input);
    if (!result.historyEntry) {
      return null;
    }

    set(result.snapshot);
    persistInventory(result.snapshot);

    const updatedProduct = result.snapshot.products.find((product) => product.id === input.productId);
    if (updatedProduct?.sellerProductId) {
      useSellerProductStore
        .getState()
        .updateStock(
          updatedProduct.sellerProductId,
          String(updatedProduct.availableStock),
          updatedProduct.warehouse,
        );
    }

    syncOfferStock();

    // Backend inventory rows use the inventory record id as `product.id`.
    const quantityDelta = (input.addStock || 0) - (input.reduceStock || 0);
    if (updatedProduct?.id && quantityDelta !== 0) {
      void adjustSellerInventory({
        inventoryId: updatedProduct.id,
        quantityDelta,
        notes: input.reason,
      })
        .then(() => get().refreshFromApi())
        .catch((error) => {
          logger.warn('Seller inventory adjust API failed; local stock kept', {
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        });
    }

    return result.historyEntry;
  },

  reserveStockForOrder: (productId, quantityMt) => {
    const result = applyReserveStockForOrder(get(), productId, quantityMt);
    if (!result.reserved) {
      return false;
    }

    set(result.snapshot);
    persistInventory(result.snapshot);
    return true;
  },
}));

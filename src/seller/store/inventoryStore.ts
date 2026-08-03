import { create } from 'zustand';

import {
  getInventory,
  persistInventory,
  reserveStockForOrder as applyReserveStockForOrder,
  updateStock as applyInventoryUpdate,
} from '@/seller/services/inventoryService';
import type { InventoryStore } from '@/seller/types';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';

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

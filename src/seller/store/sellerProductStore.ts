import { create } from 'zustand';

import {
  applyApiProductsToSnapshot,
  createNextTier,
  deleteProduct,
  deactivateProduct,
  duplicateProduct,
  fetchSellerProductsFromApi,
  getSellerProductSnapshot,
  loadProductIntoEditor,
  persistSellerProductSnapshot,
  resetEditorState,
  saveDraft,
  saveListingToBackend,
  updateStock,
} from '@/seller/services/sellerProductService';
import type { SellerProductForm, SellerProductStore, SellerTechnicalSpecs } from '@/seller/types';
import { buildEditorFromCatalogId } from '@/seller/utils/catalog';
import { canSaveListingToBackend } from '@/seller/utils/listing-input';
import { getLiveCatalogProduct } from '@/services/catalog';
import { logger } from '@/utils/logger';

const listingErrorMessage = (error: unknown): string => {
  const data = (error as { response?: { data?: { message?: unknown } } })?.response?.data;
  const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  return error instanceof Error && error.message ? error.message : 'Could not save the listing.';
};

const catalogHasSpec = (form: SellerProductForm, spec: 'mfi' | 'density'): boolean => {
  const catalog = form.catalogProductId ? getLiveCatalogProduct(form.catalogProductId) : undefined;
  return Boolean(catalog?.technicalSpecs?.[spec]);
};

const buildFormErrors = (
  form: SellerProductForm,
  technicalSpecs: SellerTechnicalSpecs,
  pricingSellingPrice: string,
  mode: 'draft' | 'publish',
): SellerProductStore['formErrors'] => {
  const errors: SellerProductStore['formErrors'] = {};

  if (!form.name.trim()) {
    errors.name = 'Grade name is required.';
  }
  if (!form.grade.trim()) {
    errors.grade = 'Grade code is required.';
  }
  if (!form.category.trim()) {
    errors.category = 'Category is required.';
  }
  if (mode === 'publish' && !form.catalogProductId?.trim()) {
    errors.category = 'Select a marketplace grade from the customer catalog.';
  }
  if (!form.brand.trim()) {
    errors.brand = 'Manufacturer / brand is required.';
  }
  if (!form.origin.trim()) {
    errors.origin = 'Origin is required.';
  }
  if (!form.polymerType.trim()) {
    errors.polymerType = 'Polymer type is required.';
  }
  if (!form.packagingType.trim()) {
    errors.packagingType = 'Packaging type is required.';
  }
  if (!form.unit.trim()) {
    errors.unit = 'Unit is required.';
  }
  if (!form.moq.trim()) {
    errors.moq = 'MOQ is required.';
  }

  if (mode === 'publish') {
    if (!form.description.trim()) {
      errors.description = 'Add a product description before publishing.';
    }
    if (!form.availableQty.trim()) {
      errors.availableQty = 'Available quantity is required.';
    }
    if (!form.warehouseLocation.trim()) {
      errors.warehouseLocation = 'Warehouse location is required.';
    }
    if (catalogHasSpec(form, 'mfi') && !technicalSpecs.mfi.trim()) {
      errors.mfi = 'MFI is required.';
    }
    if (catalogHasSpec(form, 'density') && !technicalSpecs.density.trim()) {
      errors.density = 'Density is required.';
    }
    if (!technicalSpecs.primaryApplication.trim()) {
      errors.primaryApplication = 'Primary application is required.';
    }
    if (!pricingSellingPrice.trim() || Number(pricingSellingPrice) <= 0) {
      errors.sellingPrice = 'Selling price is required.';
    }
  }

  return errors;
};

const persist = (state: SellerProductStore): void => {
  persistSellerProductSnapshot({
    products: state.products,
    draftProducts: state.draftProducts,
    publishedProducts: state.publishedProducts,
    inactiveProducts: state.inactiveProducts,
    selectedProductId: state.selectedProductId,
    form: state.form,
    pricing: state.pricing,
    tiers: state.tiers,
    technicalSpecs: state.technicalSpecs,
    dashboardStats: state.dashboardStats,
    shipments: state.shipments,
    revenueToday: state.revenueToday,
    revenueDelta: state.revenueDelta,
    pendingSettlement: state.pendingSettlement,
    overdueCount: state.overdueCount,
  });
};

export const useSellerProductStore = create<SellerProductStore>((set, get) => ({
  ...getSellerProductSnapshot(),
  isHydrated: false,
  formErrors: {},

  hydrateProductState: () => {
    set({
      ...getSellerProductSnapshot(),
      isHydrated: true,
      formErrors: {},
    });
  },

  hydrateFromApi: async () => {
    try {
      const products = await fetchSellerProductsFromApi();
      const next = applyApiProductsToSnapshot(get(), products);
      set({
        ...next,
        isHydrated: true,
        formErrors: {},
      });
      persist(get());
    } catch (error) {
      logger.warn('Seller product API hydrate failed; keeping local snapshot', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      set({
        ...getSellerProductSnapshot(),
        isHydrated: true,
        formErrors: {},
      });
    }
  },

  refreshFromApi: async () => {
    await get().hydrateFromApi();
  },

  updateFormField: (field, value) => {
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
      formErrors: {
        ...state.formErrors,
        [field]: undefined,
      },
    }));
    persist(get());
  },

  updatePricingField: (field, value) => {
    set((state) => ({
      pricing: {
        ...state.pricing,
        [field]: value,
      },
    }));
    persist(get());
  },

  updateTechnicalSpecField: (field, value) => {
    set((state) => ({
      technicalSpecs: {
        ...state.technicalSpecs,
        [field]: value,
      },
      formErrors: {
        ...state.formErrors,
        [field]: undefined,
      },
    }));
    persist(get());
  },

  addTier: () => {
    set((state) => ({
      tiers: [...state.tiers, createNextTier(state.tiers)],
    }));
    persist(get());
  },

  updateTier: (tierId, patch) => {
    set((state) => ({
      tiers: state.tiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)),
    }));
    persist(get());
  },

  deleteTier: (tierId) => {
    set((state) => ({
      tiers: state.tiers.filter((tier) => tier.id !== tierId),
    }));
    persist(get());
  },

  moveTier: (tierId, direction) => {
    const tiers = [...get().tiers];
    const index = tiers.findIndex((tier) => tier.id === tierId);
    if (index < 0) {
      return;
    }

    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= tiers.length) {
      return;
    }

    const [tier] = tiers.splice(index, 1);
    tiers.splice(nextIndex, 0, tier);
    set({ tiers });
    persist(get());
  },

  validateProductForm: (mode) => {
    const state = get();
    const formErrors = buildFormErrors(
      state.form,
      state.technicalSpecs,
      state.pricing.sellingPrice,
      mode,
    );
    set({ formErrors });
    return Object.keys(formErrors).length === 0;
  },

  saveDraftProduct: async () => {
    const state = get();
    if (!state.validateProductForm('draft')) {
      return { success: false };
    }

    try {
      const result = canSaveListingToBackend(state)
        ? await saveListingToBackend(state, state.selectedProductId, false)
        : saveDraft(state, state.selectedProductId);
      set({
        ...result.snapshot,
        formErrors: {},
      });
      persist(get());
      return { success: true, productId: result.product.id };
    } catch (error) {
      return { success: false, error: listingErrorMessage(error) };
    }
  },

  publishProduct: async () => {
    const state = get();
    if (!state.validateProductForm('publish')) {
      return { success: false };
    }

    try {
      const result = await saveListingToBackend(state, state.selectedProductId, true);
      set({
        ...resetEditorState(result.snapshot),
        formErrors: {},
      });
      persist(get());
      return { success: true, productId: result.product.id };
    } catch (error) {
      return { success: false, error: listingErrorMessage(error) };
    }
  },

  editProduct: (productId) => {
    set((state) => ({
      ...loadProductIntoEditor(state, productId),
      formErrors: {},
    }));
    persist(get());
  },

  applyCatalogGrade: (catalogId) => {
    const patch = buildEditorFromCatalogId(catalogId);
    if (!patch) {
      return false;
    }

    set((state) => ({
      form: {
        ...state.form,
        ...patch.form,
        brand: state.form.brand,
        availableQty: state.form.availableQty,
        reservedQty: state.form.reservedQty,
        warehouseLocation: state.form.warehouseLocation,
        packagingType: state.form.packagingType || '25 kg bags',
        unit: state.form.unit || 'MT',
        currency: state.form.currency || 'INR',
        gstPercent: state.form.gstPercent || '18',
      },
      pricing: patch.pricing,
      tiers: patch.tiers,
      technicalSpecs: {
        ...state.technicalSpecs,
        ...patch.technicalSpecs,
      },
      formErrors: {
        ...state.formErrors,
        name: undefined,
        grade: undefined,
        category: undefined,
        polymerType: undefined,
        origin: undefined,
        description: undefined,
        moq: undefined,
        mfi: undefined,
        density: undefined,
        primaryApplication: undefined,
      },
    }));
    persist(get());
    return true;
  },

  clearSelection: () => {
    set((state) => ({
      ...resetEditorState(state),
      formErrors: {},
    }));
    persist(get());
  },

  duplicateProduct: (productId) => {
    set((state) => ({
      ...duplicateProduct(state, productId),
    }));
    persist(get());
  },

  deleteProduct: (productId) => {
    set((state) => ({
      ...deleteProduct(state, productId),
    }));
    persist(get());
  },

  deactivateProduct: (productId) => {
    set((state) => ({
      ...deactivateProduct(state, productId),
    }));
    persist(get());
  },

  updateStock: (productId, newStock, warehouse) => {
    set((state) => ({
      ...updateStock(state, productId, newStock, warehouse),
    }));
    persist(get());
  },
}));

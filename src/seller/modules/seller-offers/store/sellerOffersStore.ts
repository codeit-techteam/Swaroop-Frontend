import { create } from 'zustand';

import { persistSellerProductSnapshot } from '@/seller/services/sellerProductService';
import { useInventoryStore } from '@/seller/store/inventoryStore';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import {
  approveOfferInSnapshot,
  buildOfferFromEditor,
  createEditorFormFromOffer,
  createEmptyEditorForm,
  createOffer,
  deleteOfferFromSnapshot,
  duplicateOfferInSnapshot,
  getOffers,
  persistSellerOffersSnapshot,
  rebuildSellerOffersSnapshot,
  saveDraftFromEditor,
  searchOffers as filterSearchOffers,
  submitOfferForReview,
  syncOfferInventory,
  updateOfferInSnapshot,
} from '@/seller/modules/seller-offers/services/sellerOffersService';
import type {
  CreateOfferInput,
  OfferEditorForm,
  OfferPricingTier,
  OfferTabFilter,
  SellerOffer,
  SellerOffersStore,
} from '@/seller/modules/seller-offers/types/offers';

const persist = (snapshot: Parameters<typeof persistSellerOffersSnapshot>[0]): void => {
  persistSellerOffersSnapshot(snapshot);
};

const syncDashboardStats = (stats: SellerOffersStore['stats']): void => {
  const productStore = useSellerProductStore.getState();
  const nextStats = productStore.dashboardStats.map((item) => {
    if (item.id === 'active-offers') {
      return { ...item, value: stats.active };
    }
    return item;
  });

  useSellerProductStore.setState({ dashboardStats: nextStats });
  const state = useSellerProductStore.getState();
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
    dashboardStats: nextStats,
    shipments: state.shipments,
    revenueToday: state.revenueToday,
    revenueDelta: state.revenueDelta,
    creditReceivables: state.creditReceivables,
    overdueCount: state.overdueCount,
  });
};

const syncInventoryForOffers = (offers: SellerOffer[]): SellerOffer[] => {
  const inventoryProducts = useInventoryStore.getState().products;
  return offers.map((offer) => {
    const inventoryItem = inventoryProducts.find(
      (product) =>
        product.id === offer.inventoryProductId ||
        product.sellerProductId === offer.productId ||
        product.productName.toLowerCase().includes(offer.grade.toLowerCase()),
    );

    if (!inventoryItem) {
      return offer;
    }

    return syncOfferInventory(offer, inventoryItem.availableStock);
  });
};

export const useSellerOffersStore = create<SellerOffersStore>((set, get) => ({
  ...getOffers(),
  isHydrated: false,

  hydrateSellerOffersState: () => {
    const base = getOffers();
    const syncedOffers = syncInventoryForOffers(base.offers);
    const snapshot = rebuildSellerOffersSnapshot(base, syncedOffers);
    set({ ...snapshot, isHydrated: true });
    persist(snapshot);
    syncDashboardStats(snapshot.stats);
  },

  refreshSellerOffersState: () => {
    const base = getOffers();
    const syncedOffers = syncInventoryForOffers(base.offers);
    const snapshot = rebuildSellerOffersSnapshot(base, syncedOffers);
    set(snapshot);
    persist(snapshot);
    syncDashboardStats(snapshot.stats);
  },

  setFilter: (filter: OfferTabFilter) => {
    const snapshot = { ...get(), filters: filter };
    set({ filters: filter });
    persist(snapshot);
  },

  setSearch: (query: string) => {
    const snapshot = { ...get(), search: query };
    set({ search: query });
    persist(snapshot);
  },

  selectOffer: (offerId) => {
    const snapshot = { ...get(), selectedOfferId: offerId };
    set({ selectedOfferId: offerId });
    persist(snapshot);
  },

  loadEditorFromOffer: (offerId) => {
    const offer = get().offers.find((item) => item.id === offerId);
    if (!offer) {
      return;
    }
    const editorForm = createEditorFormFromOffer(offer);
    const snapshot = { ...get(), editorForm, editingOfferId: offerId, selectedOfferId: offerId };
    set({ editorForm, editingOfferId: offerId, selectedOfferId: offerId });
    persist(snapshot);
  },

  resetEditor: () => {
    const editorForm = createEmptyEditorForm();
    const snapshot = { ...get(), editorForm, editingOfferId: null };
    set({ editorForm, editingOfferId: null });
    persist(snapshot);
  },

  updateEditorField: (key, value) => {
    const editorForm = { ...get().editorForm, [key]: value };
    const snapshot = { ...get(), editorForm };
    set({ editorForm });
    persist(snapshot);
  },

  addEditorTier: (tier: OfferPricingTier) => {
    const editorForm = { ...get().editorForm, tiers: [...get().editorForm.tiers, tier] };
    const snapshot = { ...get(), editorForm };
    set({ editorForm });
    persist(snapshot);
  },

  updateEditorTier: (tierId, tier) => {
    const editorForm = {
      ...get().editorForm,
      tiers: get().editorForm.tiers.map((item) =>
        item.id === tierId ? { ...item, ...tier } : item,
      ),
    };
    const snapshot = { ...get(), editorForm };
    set({ editorForm });
    persist(snapshot);
  },

  removeEditorTier: (tierId) => {
    const editorForm = {
      ...get().editorForm,
      tiers: get().editorForm.tiers.filter((item) => item.id !== tierId),
    };
    const snapshot = { ...get(), editorForm };
    set({ editorForm });
    persist(snapshot);
  },

  getFilteredOffers: () => filterSearchOffers(get().offers, get().search, get().filters),

  searchOffers: (query, tab) => filterSearchOffers(get().offers, query, tab ?? get().filters),

  getOffer: (offerId) =>
    get().offers.find((offer) => offer.id === offerId || offer.offerId === offerId),

  createOffer: (input: Partial<CreateOfferInput>) => {
    const result = createOffer(get(), input);
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  updateOffer: (offerId, input) => {
    const result = updateOfferInSnapshot(get(), offerId, input);
    if (!result.offer) {
      return null;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  saveDraft: () => {
    const result = saveDraftFromEditor(get());
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  activateOffer: (offerId) => {
    const result = submitOfferForReview(get(), offerId);
    if (!result.offer) {
      const submitted = submitOfferForReview(get());
      if (!submitted.offer) {
        return null;
      }
      set(submitted.snapshot);
      persist(submitted.snapshot);
      syncDashboardStats(submitted.snapshot.stats);
      return submitted.offer;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  pauseOffer: (offerId) => {
    const result = updateOfferInSnapshot(get(), offerId, { status: 'paused' });
    if (!result.offer) {
      return null;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  resumeOffer: (offerId) => {
    const result = updateOfferInSnapshot(get(), offerId, { status: 'active' });
    if (!result.offer) {
      return null;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  duplicateOffer: (offerId) => {
    const result = duplicateOfferInSnapshot(get(), offerId);
    if (!result.offer) {
      return null;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  deleteOffer: (offerId) => {
    const snapshot = deleteOfferFromSnapshot(get(), offerId);
    set(snapshot);
    persist(snapshot);
    syncDashboardStats(snapshot.stats);
    return true;
  },

  approveOffer: (offerId) => {
    const result = approveOfferInSnapshot(get(), offerId);
    if (!result.offer) {
      return null;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  rejectOffer: (offerId, comments) => {
    const result = updateOfferInSnapshot(get(), offerId, {
      status: 'rejected',
      reviewerComments: comments ?? 'Offer rejected by review team.',
    });
    if (!result.offer) {
      return null;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  expireOffer: (offerId) => {
    const result = updateOfferInSnapshot(get(), offerId, { status: 'expired' });
    if (!result.offer) {
      return null;
    }
    set(result.snapshot);
    persist(result.snapshot);
    syncDashboardStats(result.snapshot.stats);
    return result.offer;
  },

  refreshReviewStatus: (offerId) => {
    const offer = get().getOffer(offerId);
    if (!offer || offer.status !== 'pending_review') {
      return offer ?? null;
    }

    const approved = get().approveOffer(offerId);
    return approved;
  },

  syncInventoryFromCatalog: () => {
    const syncedOffers = syncInventoryForOffers(get().offers);
    const snapshot = rebuildSellerOffersSnapshot(get(), syncedOffers);
    set(snapshot);
    persist(snapshot);
  },

  syncDashboardStats: () => {
    syncDashboardStats(get().stats);
  },

  syncMarketplaceListings: () => {
    get().syncInventoryFromCatalog();
  },
}));

export const buildOfferPreviewFromEditor = (form: OfferEditorForm): SellerOffer =>
  buildOfferFromEditor(form, 'draft');

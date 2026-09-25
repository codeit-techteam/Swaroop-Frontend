import { create } from 'zustand';
import Toast from 'react-native-toast-message';

import { persistSellerProductSnapshot } from '@/seller/services/sellerProductService';
import { useInventoryStore } from '@/seller/store/inventoryStore';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import {
  activateOfferOnBackend,
  buildOfferFromEditor,
  cancelOfferOnBackend,
  createEditorFormFromOffer,
  createEmptyEditorForm,
  createOfferOnBackend,
  deleteOfferOnBackend,
  fetchSellerOffersSnapshot,
  pauseOfferOnBackend,
  rebuildSellerOffersSnapshot,
  searchOffers as filterSearchOffers,
  syncOfferInventory,
  updateOfferOnBackend,
} from '@/seller/modules/seller-offers/services/sellerOffersService';
import type {
  CreateOfferInput,
  OfferEditorForm,
  OfferPricingTier,
  OfferTabFilter,
  SellerOffer,
  SellerOffersStore,
} from '@/seller/modules/seller-offers/types/offers';

const showOfferError = (error: unknown, fallback: string): void => {
  const message = error instanceof Error ? error.message : fallback;
  Toast.show({
    type: 'error',
    text1: 'Offers',
    text2: message,
  });
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
    pendingSettlement: state.pendingSettlement,
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

const applyFetchedSnapshot = (
  set: (partial: Partial<SellerOffersStore>) => void,
  snapshot: Awaited<ReturnType<typeof fetchSellerOffersSnapshot>>,
  hydrated = true,
): void => {
  const syncedOffers = syncInventoryForOffers(snapshot.offers);
  const next = rebuildSellerOffersSnapshot(snapshot, syncedOffers);
  set({ ...next, isHydrated: hydrated, loadError: snapshot.loadError });
  syncDashboardStats(next.stats);
};

export const useSellerOffersStore = create<SellerOffersStore>((set, get) => ({
  offers: [],
  draftOffers: [],
  activeOffers: [],
  pausedOffers: [],
  expiredOffers: [],
  pendingReviewOffers: [],
  approvedOffers: [],
  selectedOfferId: null,
  editorForm: createEmptyEditorForm(),
  editingOfferId: null,
  filters: 'all',
  search: '',
  stats: {
    total: 0,
    active: 0,
    paused: 0,
    expired: 0,
    draft: 0,
    pendingReview: 0,
    approved: 0,
  },
  loadError: null,
  isHydrated: false,

  hydrateSellerOffersState: async () => {
    const snapshot = await fetchSellerOffersSnapshot(get(), { search: get().search });
    applyFetchedSnapshot(set, snapshot, true);
  },

  refreshSellerOffersState: async (searchOverride?: string) => {
    const search = searchOverride ?? get().search;
    if (searchOverride !== undefined) {
      set({ search: searchOverride });
    }
    const snapshot = await fetchSellerOffersSnapshot(
      { ...get(), search },
      { search },
    );
    applyFetchedSnapshot(set, snapshot, true);
  },

  setFilter: (filter: OfferTabFilter) => {
    set({ filters: filter });
  },

  setSearch: (query: string) => {
    set({ search: query });
  },

  selectOffer: (offerId) => {
    set({ selectedOfferId: offerId });
  },

  loadEditorFromOffer: (offerId) => {
    const offer = get().offers.find((item) => item.id === offerId);
    if (!offer) {
      return;
    }
    const editorForm = createEditorFormFromOffer(offer);
    set({ editorForm, editingOfferId: offerId, selectedOfferId: offerId });
  },

  resetEditor: () => {
    set({ editorForm: createEmptyEditorForm(), editingOfferId: null });
  },

  updateEditorField: (key, value) => {
    set({ editorForm: { ...get().editorForm, [key]: value } });
  },

  addEditorTier: (tier: OfferPricingTier) => {
    set({ editorForm: { ...get().editorForm, tiers: [...get().editorForm.tiers, tier] } });
  },

  updateEditorTier: (tierId, tier) => {
    set({
      editorForm: {
        ...get().editorForm,
        tiers: get().editorForm.tiers.map((item) =>
          item.id === tierId ? { ...item, ...tier } : item,
        ),
      },
    });
  },

  removeEditorTier: (tierId) => {
    set({
      editorForm: {
        ...get().editorForm,
        tiers: get().editorForm.tiers.filter((item) => item.id !== tierId),
      },
    });
  },

  getFilteredOffers: () => filterSearchOffers(get().offers, get().search, get().filters),

  searchOffers: (query, tab) => filterSearchOffers(get().offers, query, tab ?? get().filters),

  getOffer: (offerId) =>
    get().offers.find((offer) => offer.id === offerId || offer.offerId === offerId),

  createOffer: async (input: Partial<CreateOfferInput> = {}) => {
    try {
      const offer = await createOfferOnBackend(get().editorForm, input);
      await get().refreshSellerOffersState();
      set({
        selectedOfferId: offer.id,
        editorForm: createEmptyEditorForm(),
        editingOfferId: null,
      });
      return get().getOffer(offer.id) ?? offer;
    } catch (error) {
      showOfferError(error, 'Failed to create offer.');
      throw error;
    }
  },

  updateOffer: async (offerId, input) => {
    const existing = get().getOffer(offerId);
    if (!existing) {
      return null;
    }
    try {
      const form = input
        ? {
            ...createEditorFormFromOffer({ ...existing, ...input }),
          }
        : get().editingOfferId === offerId
          ? get().editorForm
          : createEditorFormFromOffer(existing);
      const updated = await updateOfferOnBackend(existing, form);
      await get().refreshSellerOffersState();
      return get().getOffer(updated.id) ?? updated;
    } catch (error) {
      showOfferError(error, 'Failed to update offer.');
      return null;
    }
  },

  saveDraft: async () => {
    try {
      const editingId = get().editingOfferId;
      if (editingId) {
        const existing = get().getOffer(editingId);
        if (!existing) {
          return null;
        }
        const updated = await updateOfferOnBackend(existing, get().editorForm);
        await get().refreshSellerOffersState();
        return get().getOffer(updated.id) ?? updated;
      }

      const created = await createOfferOnBackend(get().editorForm, { status: 'draft' });
      await get().refreshSellerOffersState();
      set({
        selectedOfferId: created.id,
        editorForm: createEmptyEditorForm(),
        editingOfferId: null,
      });
      return get().getOffer(created.id) ?? created;
    } catch (error) {
      showOfferError(error, 'Failed to save draft.');
      return null;
    }
  },

  activateOffer: async (offerId) => {
    try {
      let targetId = offerId;

      if (!targetId) {
        const created = await createOfferOnBackend(get().editorForm, { status: 'draft' });
        targetId = created.id;
      }

      const activated = await activateOfferOnBackend(targetId);
      await get().refreshSellerOffersState();
      set({
        selectedOfferId: activated.id,
        editorForm: createEmptyEditorForm(),
        editingOfferId: null,
      });
      return get().getOffer(activated.id) ?? activated;
    } catch (error) {
      showOfferError(error, 'Failed to activate offer.');
      return null;
    }
  },

  pauseOffer: async (offerId) => {
    try {
      const paused = await pauseOfferOnBackend(offerId);
      await get().refreshSellerOffersState();
      return get().getOffer(paused.id) ?? paused;
    } catch (error) {
      showOfferError(error, 'Failed to pause offer.');
      return null;
    }
  },

  resumeOffer: async (offerId) => {
    try {
      const resumed = await activateOfferOnBackend(offerId);
      await get().refreshSellerOffersState();
      return get().getOffer(resumed.id) ?? resumed;
    } catch (error) {
      showOfferError(error, 'Failed to resume offer.');
      return null;
    }
  },

  duplicateOffer: async (offerId) => {
    const source = get().getOffer(offerId);
    if (!source) {
      return null;
    }
    try {
      const form = createEditorFormFromOffer(source);
      const created = await createOfferOnBackend(form, {
        status: 'draft',
        productId: source.productId,
        allocatedStock: source.allocatedStock,
      });
      await get().refreshSellerOffersState();
      const offer = get().getOffer(created.id) ?? created;
      set({
        selectedOfferId: offer.id,
        editorForm: createEditorFormFromOffer(offer),
        editingOfferId: offer.id,
      });
      return offer;
    } catch (error) {
      showOfferError(error, 'Failed to duplicate offer.');
      return null;
    }
  },

  deleteOffer: async (offerId) => {
    try {
      await deleteOfferOnBackend(offerId);
      await get().refreshSellerOffersState();
      return true;
    } catch (error) {
      showOfferError(error, 'Failed to delete offer.');
      return false;
    }
  },

  approveOffer: async (offerId) => {
    try {
      const activated = await activateOfferOnBackend(offerId);
      await get().refreshSellerOffersState();
      return get().getOffer(activated.id) ?? activated;
    } catch (error) {
      showOfferError(error, 'Failed to approve offer.');
      return null;
    }
  },

  rejectOffer: async (offerId, _comments) => {
    try {
      const cancelled = await cancelOfferOnBackend(offerId);
      await get().refreshSellerOffersState();
      return get().getOffer(cancelled.id) ?? cancelled;
    } catch (error) {
      showOfferError(error, 'Failed to reject offer.');
      return null;
    }
  },

  expireOffer: async (offerId) => {
    try {
      const cancelled = await cancelOfferOnBackend(offerId);
      await get().refreshSellerOffersState();
      return get().getOffer(cancelled.id) ?? cancelled;
    } catch (error) {
      showOfferError(error, 'Failed to expire offer.');
      return null;
    }
  },

  refreshReviewStatus: async (offerId) => {
    await get().refreshSellerOffersState();
    return get().getOffer(offerId) ?? null;
  },

  syncInventoryFromCatalog: () => {
    const syncedOffers = syncInventoryForOffers(get().offers);
    const snapshot = rebuildSellerOffersSnapshot(get(), syncedOffers);
    set(snapshot);
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

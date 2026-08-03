export type OfferStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'active'
  | 'paused'
  | 'expired'
  | 'rejected';

export type OfferValidity = '12h' | '24h' | '72h' | '7d';

export type OfferTabFilter = 'all' | 'active' | 'paused' | 'expired';

export type OfferReviewStepStatus = 'completed' | 'in_progress' | 'pending';

export type OfferReviewTimelineStep = {
  id: string;
  title: string;
  subtitle: string;
  status: OfferReviewStepStatus;
  timestamp?: string;
};

export type OfferPricingTier = {
  id: string;
  minQty: number;
  maxQty: number | null;
  discountPercent: number;
  pricePerKg: number;
  label: string;
};

export type OfferAnalytics = {
  views: number;
  quotes: number;
  orders: number;
  conversionRate: number;
};

export type SellerOffer = {
  id: string;
  offerId: string;
  product: string;
  grade: string;
  category: string;
  warehouse: string;
  warehouseLocation: string;
  basePrice: number;
  moq: number;
  validity: OfferValidity;
  remarks: string;
  status: OfferStatus;
  allocatedStock: number;
  reservedStock: number;
  remainingStock: number;
  tiers: OfferPricingTier[];
  analytics: OfferAnalytics;
  productId?: string;
  inventoryProductId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  submittedAt?: string;
  approvedAt?: string;
  reviewerComments?: string;
  reviewTimeline: OfferReviewTimelineStep[];
};

export type OfferEditorForm = {
  productGrade: string;
  product: string;
  grade: string;
  category: string;
  basePrice: string;
  moq: string;
  remarks: string;
  validity: OfferValidity;
  warehouse: string;
  warehouseLocation: string;
  tiers: OfferPricingTier[];
};

export type OfferStats = {
  total: number;
  active: number;
  paused: number;
  expired: number;
  draft: number;
  pendingReview: number;
  approved: number;
};

export type OfferPriceHistoryEntry = {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  delta: string;
};

export type SellerOffersSnapshot = {
  offers: SellerOffer[];
  draftOffers: SellerOffer[];
  activeOffers: SellerOffer[];
  pausedOffers: SellerOffer[];
  expiredOffers: SellerOffer[];
  pendingReviewOffers: SellerOffer[];
  approvedOffers: SellerOffer[];
  selectedOfferId: string | null;
  editorForm: OfferEditorForm;
  editingOfferId: string | null;
  filters: OfferTabFilter;
  search: string;
  stats: OfferStats;
};

export type CreateOfferInput = Omit<
  SellerOffer,
  'id' | 'offerId' | 'createdAt' | 'updatedAt' | 'analytics' | 'reviewTimeline'
> & {
  status: OfferStatus;
};

export type SellerOffersStore = SellerOffersSnapshot & {
  isHydrated: boolean;
  hydrateSellerOffersState: () => void;
  refreshSellerOffersState: () => void;
  setFilter: (filter: OfferTabFilter) => void;
  setSearch: (query: string) => void;
  selectOffer: (offerId: string | null) => void;
  loadEditorFromOffer: (offerId: string) => void;
  resetEditor: () => void;
  updateEditorField: <K extends keyof OfferEditorForm>(key: K, value: OfferEditorForm[K]) => void;
  addEditorTier: (tier: OfferPricingTier) => void;
  updateEditorTier: (tierId: string, tier: Partial<OfferPricingTier>) => void;
  removeEditorTier: (tierId: string) => void;
  getFilteredOffers: () => SellerOffer[];
  searchOffers: (query: string, tab?: OfferTabFilter) => SellerOffer[];
  getOffer: (offerId: string) => SellerOffer | undefined;
  createOffer: (input: Partial<CreateOfferInput>) => SellerOffer;
  updateOffer: (offerId: string, input: Partial<SellerOffer>) => SellerOffer | null;
  saveDraft: () => SellerOffer | null;
  activateOffer: (offerId?: string) => SellerOffer | null;
  pauseOffer: (offerId: string) => SellerOffer | null;
  resumeOffer: (offerId: string) => SellerOffer | null;
  duplicateOffer: (offerId: string) => SellerOffer | null;
  deleteOffer: (offerId: string) => boolean;
  approveOffer: (offerId: string) => SellerOffer | null;
  rejectOffer: (offerId: string, comments?: string) => SellerOffer | null;
  expireOffer: (offerId: string) => SellerOffer | null;
  refreshReviewStatus: (offerId: string) => SellerOffer | null;
  syncInventoryFromCatalog: () => void;
  syncDashboardStats: () => void;
  syncMarketplaceListings: () => void;
};

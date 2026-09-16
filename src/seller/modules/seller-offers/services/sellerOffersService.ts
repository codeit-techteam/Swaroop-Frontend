import { STORAGE_KEYS } from '@/constants';
import type { MarketProduct } from '@/types/market';
import { getStorageItem, setStorageItem } from '@/utils/storage';

import type {
  CreateOfferInput,
  OfferEditorForm,
  OfferPriceHistoryEntry,
  OfferPricingTier,
  OfferReviewTimelineStep,
  OfferStats,
  OfferTabFilter,
  OfferValidity,
  SellerOffer,
  SellerOffersSnapshot,
} from '@/seller/modules/seller-offers/types/offers';

type OffersSeed = {
  offers: SellerOffer[];
};

const offersSeed = require('@/seller/modules/seller-offers/mock/offers.json') as OffersSeed;

const VALIDITY_HOURS: Record<OfferValidity, number> = {
  '12h': 12,
  '24h': 24,
  '72h': 72,
  '7d': 168,
};

export const OFFER_VALIDITY_OPTIONS: Array<{ label: string; value: OfferValidity }> = [
  { label: '12h', value: '12h' },
  { label: '24h', value: '24h' },
  { label: '72h', value: '72h' },
  { label: '7 Days', value: '7d' },
];

export const OFFER_PRODUCT_GRADES = [
  'HDPE PE100',
  'LLDPE Film Grade (C6)',
  'PP Raffia',
  'LLDPE F2001',
  'Polypropylene PP H110MA',
  'Polypropylene PP-H030SG',
] as const;

export const DEFAULT_WAREHOUSE = {
  name: 'Hazira Plant',
  location: 'Hazira, Gujarat',
};

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

const nowIso = (): string => new Date().toISOString();

const generateOfferCode = (): string => {
  const segment = Math.floor(1000 + Math.random() * 9000);
  const suffix =
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `#${segment}-${suffix}`;
};

const computeExpiresAt = (validity: OfferValidity, from = new Date()): string => {
  const hours = VALIDITY_HOURS[validity];
  return new Date(from.getTime() + hours * 60 * 60 * 1000).toISOString();
};

const buildDefaultReviewTimeline = (status: SellerOffer['status']): OfferReviewTimelineStep[] => {
  const submitted: OfferReviewTimelineStep = {
    id: 'submitted',
    title: 'Submitted',
    subtitle: 'Offer successfully queued',
    status: 'completed',
    timestamp: formatReviewTimestamp(new Date()),
  };

  const underReview: OfferReviewTimelineStep = {
    id: 'under_review',
    title: 'Under Review',
    subtitle: 'Verification by regional manager',
    status:
      status === 'pending_review' ? 'in_progress' : status === 'draft' ? 'pending' : 'completed',
    timestamp:
      status === 'pending_review' || status === 'approved' || status === 'active'
        ? formatReviewTimestamp(new Date())
        : undefined,
  };

  const approved: OfferReviewTimelineStep = {
    id: 'approved',
    title: 'Approved',
    subtitle:
      status === 'approved' || status === 'active' || status === 'paused'
        ? 'Offer is live on marketplace'
        : 'Pending final verification',
    status:
      status === 'approved' || status === 'active' || status === 'paused'
        ? 'completed'
        : status === 'pending_review'
          ? 'pending'
          : 'pending',
    timestamp:
      status === 'approved' || status === 'active' || status === 'paused'
        ? formatReviewTimestamp(new Date())
        : undefined,
  };

  return [submitted, underReview, approved];
};

export const formatReviewTimestamp = (date: Date): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

export const createEmptyEditorForm = (): OfferEditorForm => ({
  productGrade: 'HDPE PE100',
  product: 'HDPE PE100 (Pipe Grade)',
  grade: 'PE100',
  category: 'POLYMER',
  basePrice: '145',
  moq: '25',
  remarks: 'Prime material, immediate dispatch.',
  validity: '72h',
  warehouse: DEFAULT_WAREHOUSE.name,
  warehouseLocation: DEFAULT_WAREHOUSE.location,
  tiers: [
    {
      id: 'editor-tier-1',
      minQty: 0,
      maxQty: 10,
      discountPercent: 2.1,
      pricePerKg: 142,
      label: '< 10 MT',
    },
    {
      id: 'editor-tier-2',
      minQty: 10,
      maxQty: 50,
      discountPercent: 2.8,
      pricePerKg: 141,
      label: '10 - 50 MT',
    },
    {
      id: 'editor-tier-3',
      minQty: 50,
      maxQty: null,
      discountPercent: 3.8,
      pricePerKg: 139.5,
      label: '> 50 MT',
    },
  ],
});

export const createEditorFormFromOffer = (offer: SellerOffer): OfferEditorForm => ({
  productGrade: offer.product,
  product: offer.product,
  grade: offer.grade,
  category: offer.category,
  basePrice: String(offer.basePrice),
  moq: String(offer.moq),
  remarks: offer.remarks,
  validity: offer.validity,
  warehouse: offer.warehouse,
  warehouseLocation: offer.warehouseLocation,
  tiers: offer.tiers.map((tier) => ({ ...tier })),
});

const buildTierLabel = (minQty: number, maxQty: number | null): string => {
  if (minQty === 0 && maxQty !== null) {
    return `< ${maxQty} MT`;
  }
  if (maxQty === null) {
    return minQty > 0 ? `${minQty}+ MT` : '> 0 MT';
  }
  if (minQty === maxQty) {
    return `${minQty} MT`;
  }
  return `${minQty} - ${maxQty} MT`;
};

export const calculateTierPrice = (basePrice: number, discountPercent: number): number =>
  Number((basePrice * (1 - discountPercent / 100)).toFixed(2));

export const calculateDiscountPercent = (basePrice: number, tierPrice: number): number => {
  if (!basePrice) {
    return 0;
  }
  return Number((((basePrice - tierPrice) / basePrice) * 100).toFixed(1));
};

export const createTierFromInput = (
  basePrice: number,
  minQty: number,
  maxQty: number | null,
  discountPercent: number,
): OfferPricingTier => {
  const pricePerKg = calculateTierPrice(basePrice, discountPercent);
  return {
    id: `tier-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    minQty,
    maxQty,
    discountPercent,
    pricePerKg,
    label: buildTierLabel(minQty, maxQty),
  };
};

const partitionOffers = (offers: SellerOffer[]) => ({
  draftOffers: offers.filter((offer) => offer.status === 'draft'),
  activeOffers: offers.filter((offer) => offer.status === 'active'),
  pausedOffers: offers.filter((offer) => offer.status === 'paused'),
  expiredOffers: offers.filter((offer) => offer.status === 'expired'),
  pendingReviewOffers: offers.filter((offer) => offer.status === 'pending_review'),
  approvedOffers: offers.filter(
    (offer) =>
      offer.status === 'approved' || offer.status === 'active' || offer.status === 'paused',
  ),
});

const buildStats = (offers: SellerOffer[]): OfferStats => ({
  total: offers.length,
  active: offers.filter((offer) => offer.status === 'active').length,
  paused: offers.filter((offer) => offer.status === 'paused').length,
  expired: offers.filter((offer) => offer.status === 'expired').length,
  draft: offers.filter((offer) => offer.status === 'draft').length,
  pendingReview: offers.filter((offer) => offer.status === 'pending_review').length,
  approved: offers.filter(
    (offer) =>
      offer.status === 'approved' || offer.status === 'active' || offer.status === 'paused',
  ).length,
});

const sortOffers = (offers: SellerOffer[]): SellerOffer[] =>
  [...offers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

const buildSnapshot = (
  offers: SellerOffer[],
  selectedOfferId: string | null = null,
  editorForm: OfferEditorForm = createEmptyEditorForm(),
  editingOfferId: string | null = null,
  filters: OfferTabFilter = 'all',
  search = '',
): SellerOffersSnapshot => {
  const normalized = sortOffers(offers);
  const partitions = partitionOffers(normalized);

  return {
    offers: normalized,
    ...partitions,
    selectedOfferId:
      selectedOfferId && normalized.some((offer) => offer.id === selectedOfferId)
        ? selectedOfferId
        : (normalized[0]?.id ?? null),
    editorForm,
    editingOfferId,
    filters,
    search,
    stats: buildStats(normalized),
  };
};

export const buildDefaultSellerOffersSnapshot = (): SellerOffersSnapshot =>
  buildSnapshot(offersSeed.offers);

export const getOffers = (): SellerOffersSnapshot => {
  const fallback = buildDefaultSellerOffersSnapshot();
  const persisted = safeParse<Partial<SellerOffersSnapshot>>(
    getStorageItem(STORAGE_KEYS.SELLER_OFFERS_STATE),
    fallback,
  );

  const offers = persisted.offers?.length ? persisted.offers : fallback.offers;
  return buildSnapshot(
    offers,
    persisted.selectedOfferId ?? fallback.selectedOfferId,
    persisted.editorForm ?? fallback.editorForm,
    persisted.editingOfferId ?? null,
    persisted.filters ?? 'all',
    persisted.search ?? '',
  );
};

export const persistSellerOffersSnapshot = (snapshot: SellerOffersSnapshot): void => {
  setStorageItem(STORAGE_KEYS.SELLER_OFFERS_STATE, JSON.stringify(snapshot));
};

export const filterOffersByTab = (offers: SellerOffer[], tab: OfferTabFilter): SellerOffer[] => {
  switch (tab) {
    case 'active':
      return offers.filter((offer) => offer.status === 'active');
    case 'paused':
      return offers.filter((offer) => offer.status === 'paused');
    case 'expired':
      return offers.filter((offer) => offer.status === 'expired');
    case 'draft':
      return offers.filter((offer) => offer.status === 'draft');
    default:
      return offers.filter(
        (offer) => offer.status !== 'draft' && offer.status !== 'pending_review',
      );
  }
};

export const searchOffers = (
  offers: SellerOffer[],
  query: string,
  tab: OfferTabFilter = 'all',
): SellerOffer[] => {
  const tabFiltered = filterOffersByTab(offers, tab);
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return tabFiltered;
  }

  return tabFiltered.filter((offer) => {
    const haystack = [
      offer.product,
      offer.offerId,
      offer.grade,
      offer.warehouse,
      offer.warehouseLocation,
      offer.category,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
};

export const buildOfferFromEditor = (
  form: OfferEditorForm,
  status: SellerOffer['status'],
  existing?: SellerOffer,
): SellerOffer => {
  const now = nowIso();
  const basePrice = Number(form.basePrice) || 0;
  const moq = Number(form.moq) || 0;

  return {
    id: existing?.id ?? `offer-${Date.now()}`,
    offerId: existing?.offerId ?? generateOfferCode(),
    product: form.product || form.productGrade,
    grade: form.grade,
    category: form.category,
    warehouse: form.warehouse,
    warehouseLocation: form.warehouseLocation,
    basePrice,
    moq,
    validity: form.validity,
    remarks: form.remarks,
    status,
    allocatedStock: existing?.allocatedStock ?? 500,
    reservedStock: existing?.reservedStock ?? 0,
    remainingStock: existing?.remainingStock ?? 500,
    tiers: form.tiers.map((tier) => ({ ...tier })),
    analytics: existing?.analytics ?? {
      views: 0,
      quotes: 0,
      orders: 0,
      conversionRate: 0,
    },
    productId: existing?.productId,
    inventoryProductId: existing?.inventoryProductId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    expiresAt: computeExpiresAt(form.validity),
    submittedAt: status === 'pending_review' ? now : existing?.submittedAt,
    approvedAt: existing?.approvedAt,
    reviewerComments: existing?.reviewerComments,
    reviewTimeline:
      existing?.reviewTimeline?.length && status !== 'pending_review'
        ? existing.reviewTimeline
        : buildDefaultReviewTimeline(status),
  };
};

export const createOffer = (
  snapshot: SellerOffersSnapshot,
  input: Partial<CreateOfferInput>,
): { snapshot: SellerOffersSnapshot; offer: SellerOffer } => {
  const form = snapshot.editorForm;
  const offer = buildOfferFromEditor(
    {
      ...form,
      product: input.product ?? form.product,
      grade: input.grade ?? form.grade,
      category: input.category ?? form.category,
      basePrice: input.basePrice !== undefined ? String(input.basePrice) : form.basePrice,
      moq: input.moq !== undefined ? String(input.moq) : form.moq,
      remarks: input.remarks ?? form.remarks,
      validity: input.validity ?? form.validity,
      warehouse: input.warehouse ?? form.warehouse,
      warehouseLocation: input.warehouseLocation ?? form.warehouseLocation,
      tiers: input.tiers ?? form.tiers,
    },
    input.status ?? 'draft',
  );

  if (input.allocatedStock !== undefined) {
    offer.allocatedStock = input.allocatedStock;
    offer.remainingStock = input.remainingStock ?? input.allocatedStock;
  }

  const offers = sortOffers([offer, ...snapshot.offers]);
  const nextSnapshot = buildSnapshot(
    offers,
    offer.id,
    createEmptyEditorForm(),
    null,
    snapshot.filters,
    snapshot.search,
  );

  return { snapshot: nextSnapshot, offer };
};

export const updateOfferInSnapshot = (
  snapshot: SellerOffersSnapshot,
  offerId: string,
  updates: Partial<SellerOffer>,
): { snapshot: SellerOffersSnapshot; offer: SellerOffer | null } => {
  const index = snapshot.offers.findIndex((offer) => offer.id === offerId);
  if (index < 0) {
    return { snapshot, offer: null };
  }

  const updated: SellerOffer = {
    ...snapshot.offers[index],
    ...updates,
    updatedAt: nowIso(),
  };

  const offers = [...snapshot.offers];
  offers[index] = updated;

  const nextSnapshot = buildSnapshot(
    offers,
    updated.id,
    snapshot.editorForm,
    snapshot.editingOfferId,
    snapshot.filters,
    snapshot.search,
  );

  return { snapshot: nextSnapshot, offer: updated };
};

export const deleteOfferFromSnapshot = (
  snapshot: SellerOffersSnapshot,
  offerId: string,
): SellerOffersSnapshot => {
  const offers = snapshot.offers.filter((offer) => offer.id !== offerId);
  return buildSnapshot(
    offers,
    offers[0]?.id ?? null,
    snapshot.editorForm,
    snapshot.editingOfferId === offerId ? null : snapshot.editingOfferId,
    snapshot.filters,
    snapshot.search,
  );
};

export const duplicateOfferInSnapshot = (
  snapshot: SellerOffersSnapshot,
  offerId: string,
): { snapshot: SellerOffersSnapshot; offer: SellerOffer | null } => {
  const source = snapshot.offers.find((offer) => offer.id === offerId);
  if (!source) {
    return { snapshot, offer: null };
  }

  const duplicated = buildOfferFromEditor(createEditorFormFromOffer(source), 'draft');
  duplicated.product = source.product;
  duplicated.grade = source.grade;
  duplicated.category = source.category;
  duplicated.allocatedStock = source.allocatedStock;
  duplicated.remainingStock = source.remainingStock;
  duplicated.reservedStock = 0;
  duplicated.analytics = { views: 0, quotes: 0, orders: 0, conversionRate: 0 };

  const offers = sortOffers([duplicated, ...snapshot.offers]);
  const nextSnapshot = buildSnapshot(
    offers,
    duplicated.id,
    createEditorFormFromOffer(duplicated),
    duplicated.id,
    snapshot.filters,
    snapshot.search,
  );

  return { snapshot: nextSnapshot, offer: duplicated };
};

export const getPriceHistory = (): OfferPriceHistoryEntry[] => [
  {
    id: 'yesterday',
    label: 'Yesterday',
    value: '₹143.50/kg',
    trend: 'down',
    delta: '-1.0%',
  },
  {
    id: 'today',
    label: 'Today',
    value: '₹145.00/kg',
    trend: 'up',
    delta: '+1.0%',
  },
  {
    id: 'weekly',
    label: 'Weekly Trend',
    value: '₹141.80/kg avg',
    trend: 'flat',
    delta: 'Stable',
  },
];

type MarketplaceOfferProduct = MarketProduct & {
  sellerOfferId?: string;
  bulkTiers?: Array<{ range: string; pricePerKg: number }>;
};

export const mapOfferToMarketProduct = (offer: SellerOffer): MarketplaceOfferProduct => ({
  id: `offer-${offer.id}`,
  name: offer.product,
  grade: offer.grade,
  price: Math.round(offer.basePrice * 1000),
  origin: offer.warehouseLocation,
  stock: offer.remainingStock,
  moq: offer.moq,
  eta: offer.validity === '12h' ? 'Same Day' : '2–3 Days',
  category: offer.category.includes('POLY') ? 'Polypropylene' : 'HDPE',
  badge: offer.tiers.length > 0 ? 'Lowest Cost' : 'Best Value',
  image: '',
  materialType: offer.category.includes('POLY') ? 'Polypropylene' : 'HDPE',
  subCategory: offer.grade,
  description: `${offer.product} ${offer.grade} listed through verified supply.`,
  sellerOfferId: offer.id,
  bulkTiers: offer.tiers.map((tier) => ({
    range: tier.label,
    pricePerKg: tier.pricePerKg,
  })),
});

export const getActiveMarketplaceListings = (offers: SellerOffer[]): MarketplaceOfferProduct[] =>
  offers.filter((offer) => offer.status === 'active').map(mapOfferToMarketProduct);

export const syncOfferInventory = (offer: SellerOffer, availableStock: number): SellerOffer => ({
  ...offer,
  remainingStock: Math.max(availableStock - offer.reservedStock, 0),
  allocatedStock: Math.min(offer.allocatedStock, availableStock + offer.reservedStock),
  updatedAt: nowIso(),
});

export const approveOfferInSnapshot = (
  snapshot: SellerOffersSnapshot,
  offerId: string,
): { snapshot: SellerOffersSnapshot; offer: SellerOffer | null } =>
  updateOfferInSnapshot(snapshot, offerId, {
    status: 'active',
    approvedAt: nowIso(),
    reviewTimeline: buildDefaultReviewTimeline('active'),
  });

export const submitOfferForReview = (
  snapshot: SellerOffersSnapshot,
  offerId?: string,
): { snapshot: SellerOffersSnapshot; offer: SellerOffer | null } => {
  if (offerId) {
    return updateOfferInSnapshot(snapshot, offerId, {
      status: 'pending_review',
      submittedAt: nowIso(),
      reviewTimeline: buildDefaultReviewTimeline('pending_review'),
    });
  }

  const offer = buildOfferFromEditor(snapshot.editorForm, 'pending_review');
  const offers = sortOffers([offer, ...snapshot.offers]);
  const nextSnapshot = buildSnapshot(
    offers,
    offer.id,
    createEmptyEditorForm(),
    null,
    snapshot.filters,
    snapshot.search,
  );

  return { snapshot: nextSnapshot, offer };
};

export const rebuildSellerOffersSnapshot = (
  current: SellerOffersSnapshot,
  offers: SellerOffer[],
): SellerOffersSnapshot =>
  buildSnapshot(
    offers,
    current.selectedOfferId,
    current.editorForm,
    current.editingOfferId,
    current.filters,
    current.search,
  );

export const saveDraftFromEditor = (
  snapshot: SellerOffersSnapshot,
): { snapshot: SellerOffersSnapshot; offer: SellerOffer } => {
  if (snapshot.editingOfferId) {
    const form = snapshot.editorForm;
    const existing = snapshot.offers.find((offer) => offer.id === snapshot.editingOfferId);
    if (existing) {
      const updated = buildOfferFromEditor(form, 'draft', existing);
      const offers = snapshot.offers.map((item) => (item.id === updated.id ? updated : item));
      const nextSnapshot = buildSnapshot(
        offers,
        updated.id,
        form,
        updated.id,
        snapshot.filters,
        snapshot.search,
      );
      return { snapshot: nextSnapshot, offer: updated };
    }
  }

  return createOffer(snapshot, { status: 'draft' });
};

import type { MarketProduct } from '@/types/market';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';

import type {
  BackendOffer,
  BackendOfferSummary,
  CreateBackendOfferPayload,
  UpdateBackendOfferPayload,
} from '@/seller/modules/seller-offers/services/sellerOffersApi';
import {
  activateSellerOffer,
  cancelSellerOffer,
  createSellerOffer,
  deleteSellerOffer,
  listSellerOffers,
  pauseSellerOffer,
  updateSellerOffer,
} from '@/seller/modules/seller-offers/services/sellerOffersApi';
import type {
  CreateOfferInput,
  OfferEditorForm,
  OfferPriceHistoryEntry,
  OfferPricingTier,
  OfferReviewTimelineStep,
  OfferStats,
  OfferStatus,
  OfferTabFilter,
  OfferValidity,
  SellerOffer,
  SellerOffersSnapshot,
} from '@/seller/modules/seller-offers/types/offers';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

const nowIso = (): string => new Date().toISOString();

const isUuid = (value?: string | null): value is string =>
  Boolean(value && UUID_RE.test(value));

export const computeExpiresAt = (validity: OfferValidity, from = new Date()): string => {
  const hours = VALIDITY_HOURS[validity];
  return new Date(from.getTime() + hours * 60 * 60 * 1000).toISOString();
};

const inferValidity = (validFrom?: string | null, validUntil?: string | null): OfferValidity => {
  if (!validUntil) {
    return '72h';
  }
  const from = validFrom ? new Date(validFrom).getTime() : Date.now();
  const until = new Date(validUntil).getTime();
  if (!Number.isFinite(until) || !Number.isFinite(from)) {
    return '72h';
  }
  const hours = Math.max(0, (until - from) / (60 * 60 * 1000));
  if (hours <= 12) return '12h';
  if (hours <= 24) return '24h';
  if (hours <= 72) return '72h';
  return '7d';
};

export const mapBackendStatusToUi = (status?: string | null): OfferStatus => {
  switch ((status ?? '').toUpperCase()) {
    case 'DRAFT':
      return 'draft';
    case 'PENDING_REVIEW':
    case 'NEED_CHANGES':
      return 'pending_review';
    case 'ACTIVE':
      return 'active';
    case 'PAUSED':
      return 'paused';
    case 'EXPIRED':
    case 'CLOSED':
      return 'expired';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'draft';
  }
};

export const buildDefaultReviewTimeline = (
  status: SellerOffer['status'],
): OfferReviewTimelineStep[] => {
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

const num = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

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

export const mapBackendOfferToSellerOffer = (item: BackendOffer): SellerOffer => {
  const quantity = num(item.quantity);
  const reserved = num(item.inventory?.reservedQty);
  const basePrice = num(item.basePrice);
  const status = mapBackendStatusToUi(item.status);
  const warehouseName = item.warehouse?.name ?? DEFAULT_WAREHOUSE.name;
  const locationParts = [item.warehouse?.city, item.warehouse?.state].filter(Boolean);
  const warehouseLocation =
    locationParts.length > 0 ? locationParts.join(', ') : DEFAULT_WAREHOUSE.location;
  const productName = item.product?.name ?? item.grade?.displayName ?? item.grade?.name ?? 'Offer';
  const gradeLabel = item.grade?.code ?? item.grade?.name ?? '';
  const remarks =
    (typeof item.metadata?.remarks === 'string' ? item.metadata.remarks : undefined) ??
    item.deliveryTerms ??
    '';

  const tiers: OfferPricingTier[] = (item.priceTiers ?? []).map((tier, index) => {
    const minQty = num(tier.minQty);
    const maxQty =
      tier.maxQty === null || tier.maxQty === undefined ? null : num(tier.maxQty);
    const pricePerKg = num(tier.price);
    const discountPercent =
      basePrice > 0 ? Number((((basePrice - pricePerKg) / basePrice) * 100).toFixed(1)) : 0;
    return {
      id: tier.id ?? `tier-${item.id}-${index}`,
      minQty,
      maxQty,
      discountPercent,
      pricePerKg,
      label: buildTierLabel(minQty, maxQty),
    };
  });

  const quotes = num(item._count?.purchaseRequestItems);

  return {
    id: item.id,
    offerId: item.referenceNumber ?? item.id,
    product: productName,
    grade: gradeLabel,
    category: item.grade?.name ?? 'POLYMER',
    warehouse: warehouseName,
    warehouseLocation,
    basePrice,
    moq: num(item.moq),
    validity: inferValidity(item.validFrom, item.validUntil),
    remarks,
    status,
    allocatedStock: quantity,
    reservedStock: reserved,
    remainingStock: Math.max(quantity - reserved, 0),
    tiers,
    analytics: {
      views: 0,
      quotes,
      orders: 0,
      conversionRate: 0,
    },
    productId: item.productId ?? item.product?.id,
    inventoryProductId: item.inventoryId ?? item.inventory?.id ?? undefined,
    warehouseId: item.warehouseId ?? item.warehouse?.id ?? undefined,
    gradeId: item.gradeId ?? item.grade?.id ?? undefined,
    version: item.version,
    createdAt: item.createdAt ?? nowIso(),
    updatedAt: item.updatedAt ?? item.createdAt ?? nowIso(),
    expiresAt: item.validUntil ?? computeExpiresAt('72h'),
    submittedAt:
      status === 'pending_review' || status === 'active' || status === 'paused'
        ? item.updatedAt ?? item.createdAt
        : undefined,
    approvedAt: status === 'active' || status === 'paused' ? item.updatedAt : undefined,
    reviewTimeline: buildDefaultReviewTimeline(status),
  };
};

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
  productId: undefined,
  warehouseId: undefined,
  inventoryId: undefined,
  quantity: '500',
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
  productId: offer.productId,
  warehouseId: offer.warehouseId,
  inventoryId: offer.inventoryProductId,
  quantity: String(offer.allocatedStock),
  tiers: offer.tiers.map((tier) => ({ ...tier })),
});

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

const buildStats = (
  offers: SellerOffer[],
  summary?: BackendOfferSummary | null,
): OfferStats => {
  if (summary) {
    return {
      total: num(summary.total, offers.length),
      active: num(summary.active),
      paused: num(summary.paused),
      expired: num(summary.expired),
      draft: num(summary.draft),
      pendingReview: num(summary.pendingReview),
      approved: num(summary.active) + num(summary.paused),
    };
  }

  return {
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
  };
};

const sortOffers = (offers: SellerOffer[]): SellerOffer[] =>
  [...offers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const buildSnapshot = (
  offers: SellerOffer[],
  selectedOfferId: string | null = null,
  editorForm: OfferEditorForm = createEmptyEditorForm(),
  editingOfferId: string | null = null,
  filters: OfferTabFilter = 'all',
  search = '',
  summary?: BackendOfferSummary | null,
  loadError: string | null = null,
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
    stats: buildStats(normalized, summary),
    loadError,
  };
};

export const buildDefaultSellerOffersSnapshot = (): SellerOffersSnapshot =>
  buildSnapshot([]);

/** Empty in-memory baseline — backend is the source of truth. */
export const getOffers = (): SellerOffersSnapshot => buildDefaultSellerOffersSnapshot();

/** No longer persists authoritative offer list; kept as no-op for call-site compatibility. */
export const persistSellerOffersSnapshot = (_snapshot: SellerOffersSnapshot): void => {
  // Intentionally empty — AsyncStorage is not the source of truth for offers.
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

export const resolveOfferProductId = (
  form: OfferEditorForm,
  input?: Partial<CreateOfferInput>,
): string => {
  const candidates = [
    input?.productId,
    form.productId,
    useSellerProductStore.getState().selectedProductId ?? undefined,
  ];

  for (const candidate of candidates) {
    if (isUuid(candidate)) {
      return candidate;
    }
  }

  const products = useSellerProductStore.getState().products;
  const needleProduct = (input?.product ?? form.product ?? form.productGrade).trim().toLowerCase();
  const needleGrade = (input?.grade ?? form.grade).trim().toLowerCase();

  const match = products.find((product) => {
    if (isUuid(product.id) && (product.id === input?.productId || product.id === form.productId)) {
      return true;
    }
    const name = product.form.name.trim().toLowerCase();
    const grade = product.form.grade.trim().toLowerCase();
    return (
      (needleProduct && (name === needleProduct || name.includes(needleProduct))) ||
      (needleGrade && grade === needleGrade)
    );
  });

  if (match) {
    if (isUuid(match.id)) {
      return match.id;
    }
    if (isUuid(match.form.catalogProductId)) {
      return match.form.catalogProductId;
    }
  }

  throw new Error(
    'Select a product listing before creating an offer. A backend productId is required.',
  );
};

export const buildCreatePayloadFromEditor = (
  form: OfferEditorForm,
  input?: Partial<CreateOfferInput>,
): CreateBackendOfferPayload => {
  const productId = resolveOfferProductId(form, input);
  const basePrice = num(input?.basePrice ?? form.basePrice);
  const moq = num(input?.moq ?? form.moq);
  const quantity = num(
    input?.allocatedStock ?? form.quantity ?? input?.remainingStock ?? 500,
    500,
  );
  const validity = input?.validity ?? form.validity;
  const remarks = input?.remarks ?? form.remarks;
  const tiers = input?.tiers ?? form.tiers;

  if (!productId) {
    throw new Error(
      'Select a product listing before creating an offer. A backend productId is required.',
    );
  }
  if (basePrice <= 0) {
    throw new Error('Base price must be greater than 0.');
  }
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0.');
  }

  return {
    productId,
    warehouseId: form.warehouseId || input?.warehouseId || undefined,
    inventoryId: form.inventoryId || input?.inventoryProductId || undefined,
    quantity,
    moq: moq > 0 ? moq : undefined,
    unit: 'MT',
    basePrice,
    validUntil: computeExpiresAt(validity),
    deliveryTerms: remarks || undefined,
    metadata: remarks ? { remarks } : undefined,
    priceTiers: tiers.map((tier) => ({
      minQty: tier.minQty,
      maxQty: tier.maxQty ?? undefined,
      price: tier.pricePerKg,
    })),
  };
};

export const buildUpdatePayloadFromEditor = (
  form: OfferEditorForm,
  offer: SellerOffer,
): UpdateBackendOfferPayload => {
  const base = buildCreatePayloadFromEditor(form, {
    productId: form.productId ?? offer.productId,
    allocatedStock: num(form.quantity, offer.allocatedStock),
  });
  return {
    ...base,
    version: offer.version,
  };
};

export const buildOfferFromEditor = (
  form: OfferEditorForm,
  status: SellerOffer['status'],
  existing?: SellerOffer,
): SellerOffer => {
  const now = nowIso();
  const basePrice = Number(form.basePrice) || 0;
  const moq = Number(form.moq) || 0;
  const quantity = Number(form.quantity) || existing?.allocatedStock || 500;

  return {
    id: existing?.id ?? `offer-${Date.now()}`,
    offerId: existing?.offerId ?? `#LOCAL`,
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
    allocatedStock: quantity,
    reservedStock: existing?.reservedStock ?? 0,
    remainingStock: existing?.remainingStock ?? quantity,
    tiers: form.tiers.map((tier) => ({ ...tier })),
    analytics: existing?.analytics ?? {
      views: 0,
      quotes: 0,
      orders: 0,
      conversionRate: 0,
    },
    productId: form.productId ?? existing?.productId,
    inventoryProductId: form.inventoryId ?? existing?.inventoryProductId,
    warehouseId: form.warehouseId ?? existing?.warehouseId,
    gradeId: existing?.gradeId,
    version: existing?.version,
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

export const fetchSellerOffersSnapshot = async (
  current: SellerOffersSnapshot,
  options?: { search?: string },
): Promise<SellerOffersSnapshot> => {
  const search = options?.search ?? current.search;
  try {
    const { items } = await listSellerOffers({
      page: 1,
      limit: 100,
      search: search.trim() || undefined,
    });
    const offers = items.map(mapBackendOfferToSellerOffer);
    return buildSnapshot(
      offers,
      current.selectedOfferId,
      current.editorForm,
      current.editingOfferId,
      current.filters,
      search,
      null,
      null,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load offers from backend.';
    return buildSnapshot(
      [],
      current.selectedOfferId,
      current.editorForm,
      current.editingOfferId,
      current.filters,
      search,
      null,
      message,
    );
  }
};

export const createOfferOnBackend = async (
  form: OfferEditorForm,
  input?: Partial<CreateOfferInput>,
): Promise<SellerOffer> => {
  const payload = buildCreatePayloadFromEditor(form, input);
  const created = await createSellerOffer(payload);
  return mapBackendOfferToSellerOffer(created);
};

export const updateOfferOnBackend = async (
  offer: SellerOffer,
  form: OfferEditorForm,
): Promise<SellerOffer> => {
  const payload = buildUpdatePayloadFromEditor(form, offer);
  const updated = await updateSellerOffer(offer.id, payload);
  return mapBackendOfferToSellerOffer(updated);
};

export const activateOfferOnBackend = async (offerId: string): Promise<SellerOffer> => {
  const updated = await activateSellerOffer(offerId);
  return mapBackendOfferToSellerOffer(updated);
};

export const pauseOfferOnBackend = async (offerId: string): Promise<SellerOffer> => {
  const updated = await pauseSellerOffer(offerId);
  return mapBackendOfferToSellerOffer(updated);
};

export const deleteOfferOnBackend = async (offerId: string): Promise<void> => {
  await deleteSellerOffer(offerId);
};

export const cancelOfferOnBackend = async (offerId: string): Promise<SellerOffer> => {
  const updated = await cancelSellerOffer(offerId);
  return mapBackendOfferToSellerOffer(updated);
};

/** Local snapshot helpers retained for preview / offline UI composition only. */
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
      productId: input.productId ?? form.productId,
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
    null,
    snapshot.loadError,
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
    null,
    snapshot.loadError,
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
    null,
    snapshot.loadError,
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
  duplicated.productId = source.productId;
  duplicated.analytics = { views: 0, quotes: 0, orders: 0, conversionRate: 0 };

  const offers = sortOffers([duplicated, ...snapshot.offers]);
  const nextSnapshot = buildSnapshot(
    offers,
    duplicated.id,
    createEditorFormFromOffer(duplicated),
    duplicated.id,
    snapshot.filters,
    snapshot.search,
    null,
    snapshot.loadError,
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
    null,
    snapshot.loadError,
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
    null,
    current.loadError,
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
        null,
        snapshot.loadError,
      );
      return { snapshot: nextSnapshot, offer: updated };
    }
  }

  return createOffer(snapshot, { status: 'draft' });
};

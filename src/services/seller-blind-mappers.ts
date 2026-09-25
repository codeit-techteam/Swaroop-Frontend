/**
 * Pure blind-marketplace mappers (no API client imports).
 * Keep these aligned with seller-purchase-requests.ts / seller-operations.ts.
 */

export type BlindBuyerPayload = {
  displayName?: string;
  reference?: string;
};

export type BlindPrInput = {
  id: string;
  referenceNumber?: string;
  status?: string;
  paymentMethod?: string | null;
  targetPrice?: unknown;
  destinationRegion?: string | null;
  notes?: string | null;
  createdAt?: string;
  responseDeadline?: string | null;
  remainingSeconds?: number | null;
  allowedActions?: string[];
  buyer?: BlindBuyerPayload;
  items?: Array<{
    product?: { id?: string; name?: string } | null;
    grade?: { name?: string; code?: string; displayName?: string | null } | null;
    quantity?: unknown;
    unit?: string;
    targetUnitPrice?: unknown;
  }>;
};

export type BlindPrMapped = {
  id: string;
  requestNumber: string;
  productId: string;
  productName: string;
  gradeName: string;
  category: string;
  quantityMt: number;
  unit: string;
  requestedPrice: number;
  currency: string;
  deliveryLocation: string;
  paymentTerms: string;
  notes: string;
  status: string;
  buyerLabel: string;
  buyerReference: string;
  receivedAt: string;
  responseDeadline: string | null;
  remainingSeconds: number | null;
  allowedActions: string[];
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function iso(value: unknown): string {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function paymentLabel(method?: string | null): string {
  const key = (method ?? '').toUpperCase();
  if (key.includes('LOAD')) return 'On Loading';
  if (key.includes('DELIV')) return 'On Delivery';
  if (key.includes('30')) return 'Credit 30 Days';
  if (key.includes('CREDIT') || key.includes('15')) return 'Credit 15 Days';
  if (key.includes('ADVANCE')) return 'Advance Payment';
  return method?.trim() || 'Advance Payment';
}

function mapPrStatus(status?: string): string {
  switch ((status ?? '').toUpperCase()) {
    case 'APPROVED':
    case 'CONVERTED_TO_ORDER':
      return 'accepted';
    case 'REJECTED':
    case 'CANCELLED':
    case 'WITHDRAWN':
      return 'rejected';
    case 'EXPIRED':
      return 'expired';
    case 'NEGOTIATION':
    case 'OFFER_RECEIVED':
      return 'counter_sent';
    case 'UNDER_REVIEW':
    case 'SOURCING':
    case 'PENDING_APPROVAL':
      return 'under_review';
    default:
      return 'new';
  }
}

/** Maps seller PR API payload → mobile card model without customer PII fields. */
export function mapBlindSellerPurchaseRequest(item: BlindPrInput): BlindPrMapped {
  const line = item.items?.[0];
  const productName =
    line?.product?.name ??
    line?.grade?.displayName ??
    line?.grade?.name ??
    'Purchase request';
  return {
    id: item.id,
    requestNumber: item.referenceNumber ?? item.id,
    productId: line?.product?.id ?? item.id,
    productName,
    gradeName: line?.grade?.name ?? line?.grade?.code ?? productName,
    category: line?.grade?.name ?? 'Grade',
    quantityMt: num(line?.quantity),
    unit: line?.unit ?? 'MT',
    requestedPrice: num(line?.targetUnitPrice ?? item.targetPrice),
    currency: 'INR',
    deliveryLocation: item.destinationRegion ?? 'Assigned destination',
    paymentTerms: paymentLabel(item.paymentMethod),
    notes: item.notes ?? '',
    status: mapPrStatus(item.status),
    buyerLabel: item.buyer?.displayName ?? 'Anonymous Buyer',
    buyerReference: item.buyer?.reference ?? 'BUYER-UNKNOWN',
    receivedAt: iso(item.createdAt),
    responseDeadline: item.responseDeadline ?? null,
    remainingSeconds:
      item.remainingSeconds == null ? null : num(item.remainingSeconds),
    allowedActions: Array.isArray(item.allowedActions) ? item.allowedActions : [],
  };
}

export function mapBlindSellerOrderBuyer(buyer?: BlindBuyerPayload): {
  buyerId: string;
  buyerName: string;
} {
  return {
    buyerId: buyer?.reference ?? '',
    buyerName: buyer?.displayName ?? 'ANONYMOUS BUYER',
  };
}

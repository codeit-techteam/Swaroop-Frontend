import { isAxiosError } from 'axios';

import type {
  ImportListing,
  ImportListingStatus,
  ImportQuantityUnit,
} from '@/features/import/types';

const LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  MATCHING: 'Matching',
  OFFER_RECEIVED: 'Offer received',
  NEGOTIATION: 'Negotiation',
  MATCHED: 'Matched',
  DEAL_CONFIRMED: 'Deal confirmed',
  PARTIALLY_FULFILLED: 'Partially fulfilled',
  FULFILLED: 'Fulfilled',
  PAUSED: 'Paused',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  OPEN: 'Open',
  AGREED: 'Agreed',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  PENDING_CONFIRMATION: 'Awaiting confirmation',
  CONFIRMED: 'Confirmed',
  MT: 'MT',
  KG: 'KG',
  CONTAINER: 'Container',
  OTHER: 'Other',
  FIXED: 'Fixed',
  NEGOTIABLE: 'Negotiable',
  INDICATIVE: 'Indicative',
  FORMULA_BASED: 'Formula based',
  INDEX_LINKED: 'Index linked',
  GST_EXTRA: 'GST extra',
  GST_INCLUDED: 'GST included',
  GST_APPLICABLE: 'GST applicable',
  GST_EXEMPT_NIL: 'GST exempt / nil',
  ALLOWED: 'Allowed',
  NOT_ALLOWED: 'Not allowed',
  FCL: 'FCL',
  LCL: 'LCL',
  BULK: 'Bulk',
  FT_20: '20 ft',
  FT_40: '40 ft',
  NO_INSPECTION: 'No inspection',
  SELLER_INSPECTION: 'Seller inspection',
  SGS: 'SGS',
  BUREAU_VERITAS: 'Bureau Veritas',
  OTHER_THIRD_PARTY: 'Other third party',
  BUYER_INSPECTION: 'Buyer inspection',
  READY_STOCK: 'Ready stock',
  PRODUCTION: 'Production',
  FUTURE_SHIPMENT: 'Future shipment',
  OPENED: 'Offer sent',
  COUNTER: 'Counteroffer',
  ACCEPTED: 'Accepted',
  PRODUCT: 'Product',
  GRADE: 'Grade',
  BRAND: 'Brand',
  ORIGIN: 'Origin',
  QUANTITY: 'Quantity',
  MOQ: 'MOQ',
  PRICE: 'Price',
  CURRENCY: 'Currency',
  INCOTERM: 'Incoterm',
  POL: 'Port of loading',
  POD: 'Port of discharge',
  PAYMENT_TERMS: 'Payment terms',
  SHIPMENT_WINDOW: 'Shipment window',
  QUALITY: 'Quality & documents',
  BUYER: 'Buyer',
  SELLER: 'Seller',
  SYSTEM: 'System',
  SUGGESTED: 'Suggested',
  DISMISSED: 'Dismissed',
  NEGOTIATING: 'Negotiating',
  CONVERTED: 'Converted',
  STALE: 'Outdated',
  COA: 'Certificate of analysis (COA)',
  TDS: 'Technical data sheet (TDS)',
  SDS: 'Safety data sheet (SDS)',
  MSDS: 'Material safety data sheet (MSDS)',
};

export function importLabel(value?: string | null): string {
  if (!value) return '—';
  return (
    LABELS[value] ??
    value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<string, Tone> = {
  DRAFT: 'neutral',
  PUBLISHED: 'info',
  MATCHING: 'info',
  OFFER_RECEIVED: 'warning',
  NEGOTIATION: 'warning',
  MATCHED: 'success',
  DEAL_CONFIRMED: 'success',
  PARTIALLY_FULFILLED: 'success',
  FULFILLED: 'success',
  PAUSED: 'neutral',
  EXPIRED: 'danger',
  CANCELLED: 'danger',
  OPEN: 'warning',
  AGREED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
  PENDING_CONFIRMATION: 'warning',
  CONFIRMED: 'success',
};

export const toneFor = (status: string): Tone => TONES[status] ?? 'neutral';

/** Formats a decimal string without float rounding (grouping only). */
export function formatDecimal(value?: string | null, maxFraction = 4): string {
  if (value === null || value === undefined || value === '') return '—';
  const [int = '', frac = ''] = value.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const trimmed = frac.slice(0, maxFraction).replace(/0+$/, '');
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}

export function formatQty(value?: string | null, unit?: ImportQuantityUnit | null): string {
  if (!value) return '—';
  return `${formatDecimal(value, 3)} ${unit ? importLabel(unit) : ''}`.trim();
}

/** "USD 1,050.00 / MT" — currency is always explicit; never converted. */
export function formatPrice(
  value?: string | null,
  currencyCode?: string | null,
  unit?: ImportQuantityUnit | null,
): string {
  if (!value) return '—';
  const [int = '', frac = ''] = value.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const significant = frac.slice(0, 4).replace(/0+$/, '');
  const amount = `${grouped}.${significant.padEnd(2, '0')}`;
  const per = unit ? ` / ${importLabel(unit)}` : '';
  return `${currencyCode ?? ''} ${amount}${per}`.trim();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Date-only values (YYYY-MM-DD) are calendar dates and never shifted by time zone. */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return `${d} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDate(value)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatRemaining(seconds: number | null): string {
  if (seconds === null) return 'No expiry set';
  if (seconds <= 0) return 'Expired';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${Math.max(1, m)}m left`;
}

/** Local calendar date as YYYY-MM-DD. */
export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function listingTitle(l: ImportListing): string {
  const product = l.product.category?.name ?? 'Product not set';
  const grade = l.product.grade?.name ?? l.product.customGradeName;
  return grade ? `${product} · ${grade}` : product;
}

export function portLabel(p?: { code: string; name: string } | null): string {
  return p ? `${p.name} (${p.code})` : '—';
}

export const OPEN_STATUSES: ImportListingStatus[] = [
  'PUBLISHED',
  'MATCHING',
  'OFFER_RECEIVED',
  'NEGOTIATION',
];

export type ImportFieldError = { field: string; code: string; message: string };

export type ImportApiError = {
  status: number | null;
  code: string;
  message: string;
  fields: ImportFieldError[];
};

/** Normalises Import (`{code,message,details}`) and validation-pipe errors. */
export function parseImportError(error: unknown): ImportApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const body = (error.response?.data ?? {}) as Record<string, unknown>;
    const details = Array.isArray(body.details)
      ? (body.details as ImportFieldError[]).filter((d) => d && typeof d.field === 'string')
      : [];
    const rawMessage = body.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join('. ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : status === null
          ? 'Network error. Check your connection and try again.'
          : 'Something went wrong. Please try again.';
    return {
      status,
      code: typeof body.code === 'string' ? body.code : `HTTP_${status ?? 0}`,
      message,
      fields: details,
    };
  }
  return {
    status: null,
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'Something went wrong.',
    fields: [],
  };
}

export function newIdempotencyKey(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export const DECIMAL_QTY = /^\d{1,15}(\.\d{1,3})?$/;
export const DECIMAL_PRICE = /^\d{1,14}(\.\d{1,4})?$/;

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

export type SellerSettlementStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'RELEASED'
  | 'FAILED'
  | 'CANCELLED'
  | 'ON_HOLD';

export type BlindBuyerRef = {
  displayName: string;
  reference: string;
};

export type SellerSettlement = {
  id: string;
  settlementNumber: string;
  referenceNumber: string;
  purchaseOrderId: string | null;
  orderId: string | null;
  orderNumber: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
  proformaInvoiceId: string | null;
  proformaInvoiceNumber: string | null;
  status: SellerSettlementStatus;
  currency: string;
  grossAmount: number;
  taxAmount: number;
  platformFee: number;
  tdsAmount: number;
  otherDeductions: number;
  deductions: number;
  netAmount: number;
  settlementDate: string | null;
  releasedAt: string | null;
  expectedSettlementDate: string | null;
  buyer: BlindBuyerRef;
  createdAt: string;
  updatedAt: string;
};

export type SellerSettlementTimelineEvent = {
  id: string;
  event: string;
  label: string;
  description: string | null;
  status: 'completed' | 'current' | 'pending';
  at: string;
  source: string;
};

export type SellerSettlementDetail = SellerSettlement & {
  relatedPurchaseOrder: {
    id: string;
    referenceNumber: string;
    quantity: string | null;
    unit: string;
    unitPrice: number | null;
    orderValue: number | null;
    productName: string | null;
    gradeName: string | null;
  } | null;
  relatedInvoice: {
    id: string;
    invoiceNumber: string | null;
    status: string | null;
  } | null;
  relatedProformaInvoice: {
    id: string;
    piNumber: string | null;
    status: string | null;
  } | null;
  relatedPayment: {
    id: string;
    referenceNumber: string;
    status: string;
    utr: string | null;
    amount: number;
    paidAt: string | null;
    verifiedAt: string | null;
  } | null;
  deductionBreakdown: Array<{ code: string; label: string; amount: number }>;
  items: Array<{
    id: string;
    description: string | null;
    amount: number;
    paymentId: string | null;
    paymentReference: string | null;
  }>;
  pendingReason: string | null;
  timeline: SellerSettlementTimelineEvent[];
};

export type SellerSettlementSummary = {
  totalSales: number;
  settledAmount: number;
  pendingSettlementAmount: number;
  outstandingSettlementAmount: number;
  nextSettlementAmount: number | null;
  nextSettlementId: string | null;
  nextSettlementNumber: string | null;
  totalCount: number;
  byStatus: Record<string, { count: number; grossAmount: number; netAmount: number }>;
};

export type SellerSettlementListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type SellerSettlementPage = {
  items: SellerSettlement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SellerPayment = {
  id: string;
  paymentId: string;
  orderId: string;
  buyerRef: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  reference: string;
};

export type SellerProformaInvoice = {
  id: string;
  piNumber: string;
  purchaseOrderId: string | null;
  status: string;
  amount: number;
  currency: string;
  buyer: BlindBuyerRef;
  createdAt: string;
};

function money(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function moneyOrNull(value: unknown): number | null {
  if (value == null || value === '') return null;
  return money(value);
}

function asStatus(value: unknown): SellerSettlementStatus {
  const raw = String(value ?? 'PENDING').toUpperCase();
  const allowed: SellerSettlementStatus[] = [
    'PENDING',
    'PROCESSING',
    'READY',
    'RELEASED',
    'FAILED',
    'CANCELLED',
    'ON_HOLD',
  ];
  return (allowed.includes(raw as SellerSettlementStatus)
    ? raw
    : 'PENDING') as SellerSettlementStatus;
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

function unwrapData<T>(response: { data: Envelope<T> }): T {
  return response.data.data;
}

function mapSettlement(raw: Record<string, unknown>): SellerSettlement {
  const buyerRaw = (raw.buyer ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id),
    settlementNumber: String(
      raw.settlementNumber ?? raw.referenceNumber ?? raw.id,
    ),
    referenceNumber: String(raw.referenceNumber ?? raw.settlementNumber ?? raw.id),
    purchaseOrderId: raw.purchaseOrderId ? String(raw.purchaseOrderId) : null,
    orderId: raw.orderId
      ? String(raw.orderId)
      : raw.purchaseOrderId
        ? String(raw.purchaseOrderId)
        : null,
    orderNumber: raw.orderNumber ? String(raw.orderNumber) : null,
    invoiceId: raw.invoiceId ? String(raw.invoiceId) : null,
    invoiceNumber: raw.invoiceNumber ? String(raw.invoiceNumber) : null,
    proformaInvoiceId: raw.proformaInvoiceId
      ? String(raw.proformaInvoiceId)
      : null,
    proformaInvoiceNumber: raw.proformaInvoiceNumber
      ? String(raw.proformaInvoiceNumber)
      : null,
    status: asStatus(raw.status),
    currency: String(raw.currency ?? 'INR'),
    grossAmount: money(raw.grossAmount),
    taxAmount: money(raw.taxAmount),
    platformFee: money(raw.platformFee),
    tdsAmount: money(raw.tdsAmount),
    otherDeductions: money(raw.otherDeductions ?? raw.deductions),
    deductions: money(raw.deductions),
    netAmount: money(raw.netAmount),
    settlementDate: raw.settlementDate ? String(raw.settlementDate) : null,
    releasedAt: raw.releasedAt ? String(raw.releasedAt) : null,
    expectedSettlementDate: raw.expectedSettlementDate
      ? String(raw.expectedSettlementDate)
      : null,
    buyer: {
      displayName: String(buyerRaw.displayName ?? 'Anonymous Buyer'),
      reference: String(buyerRaw.reference ?? 'BUYER-UNKNOWN'),
    },
    createdAt: String(raw.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date(0).toISOString()),
  };
}

function mapTimeline(raw: unknown): SellerSettlementTimelineEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `event-${index}`),
      event: String(row.event ?? 'EVENT'),
      label: String(row.label ?? row.event ?? 'Event'),
      description: row.description == null ? null : String(row.description),
      status:
        row.status === 'current' || row.status === 'pending'
          ? row.status
          : 'completed',
      at: String(row.at ?? row.createdAt ?? ''),
      source: String(row.source ?? 'settlement'),
    };
  });
}

function mapDetail(raw: Record<string, unknown>): SellerSettlementDetail {
  const base = mapSettlement(raw);
  const po = (raw.relatedPurchaseOrder ?? null) as Record<string, unknown> | null;
  const invoice = (raw.relatedInvoice ?? null) as Record<string, unknown> | null;
  const proforma = (raw.relatedProformaInvoice ?? null) as Record<
    string,
    unknown
  > | null;
  const payment = (raw.relatedPayment ?? null) as Record<string, unknown> | null;
  const breakdown = Array.isArray(raw.deductionBreakdown)
    ? raw.deductionBreakdown.map((item) => {
        const row = (item ?? {}) as Record<string, unknown>;
        return {
          code: String(row.code ?? 'OTHER'),
          label: String(row.label ?? 'Deduction'),
          amount: money(row.amount),
        };
      })
    : [];
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => {
        const row = (item ?? {}) as Record<string, unknown>;
        return {
          id: String(row.id),
          description: row.description == null ? null : String(row.description),
          amount: money(row.amount),
          paymentId: row.paymentId ? String(row.paymentId) : null,
          paymentReference: row.paymentReference
            ? String(row.paymentReference)
            : null,
        };
      })
    : [];

  return {
    ...base,
    relatedPurchaseOrder: po
      ? {
          id: String(po.id),
          referenceNumber: String(po.referenceNumber ?? ''),
          quantity: po.quantity == null ? null : String(po.quantity),
          unit: String(po.unit ?? 'MT'),
          unitPrice: moneyOrNull(po.unitPrice),
          orderValue: moneyOrNull(po.orderValue),
          productName: po.productName == null ? null : String(po.productName),
          gradeName: po.gradeName == null ? null : String(po.gradeName),
        }
      : null,
    relatedInvoice: invoice
      ? {
          id: String(invoice.id),
          invoiceNumber: invoice.invoiceNumber
            ? String(invoice.invoiceNumber)
            : null,
          status: invoice.status ? String(invoice.status) : null,
        }
      : null,
    relatedProformaInvoice: proforma
      ? {
          id: String(proforma.id),
          piNumber: proforma.piNumber ? String(proforma.piNumber) : null,
          status: proforma.status ? String(proforma.status) : null,
        }
      : null,
    relatedPayment: payment
      ? {
          id: String(payment.id),
          referenceNumber: String(payment.referenceNumber ?? ''),
          status: String(payment.status ?? ''),
          utr: payment.utr ? String(payment.utr) : null,
          amount: money(payment.amount),
          paidAt: payment.paidAt ? String(payment.paidAt) : null,
          verifiedAt: payment.verifiedAt ? String(payment.verifiedAt) : null,
        }
      : null,
    deductionBreakdown: breakdown,
    items,
    pendingReason: raw.pendingReason == null ? null : String(raw.pendingReason),
    timeline: mapTimeline(raw.timeline),
  };
}

export async function fetchSellerSettlementsPage(
  params: SellerSettlementListParams = {},
): Promise<SellerSettlementPage> {
  return withSellerSession(async () => {
    const status =
      params.status && params.status !== 'ALL' && params.status !== 'all'
        ? params.status
        : undefined;

    const response = await apiClient.get<Envelope<Record<string, unknown>[]>>(
      '/seller/settlements',
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          search: params.search?.trim() || undefined,
          status,
          sortBy: params.sortBy ?? 'createdAt',
          sortOrder: params.sortOrder ?? 'desc',
        },
      },
    );

    const items = Array.isArray(response.data.data)
      ? response.data.data.map((row) => mapSettlement(row))
      : [];
    const meta = response.data.meta ?? {};

    return {
      items,
      meta: {
        page: meta.page ?? params.page ?? 1,
        limit: meta.limit ?? params.limit ?? 20,
        total: meta.total ?? items.length,
        totalPages: meta.totalPages ?? 1,
      },
    };
  });
}

export async function fetchSellerSettlementSummary(): Promise<SellerSettlementSummary> {
  return withSellerSession(async () => {
    const data = unwrapData(
      await apiClient.get<Envelope<Record<string, unknown>>>(
        '/seller/settlements/summary',
      ),
    );
    const byStatusRaw =
      data.byStatus && typeof data.byStatus === 'object'
        ? (data.byStatus as Record<string, Record<string, unknown>>)
        : {};

    return {
      totalSales: money(data.totalSales),
      settledAmount: money(data.settledAmount),
      pendingSettlementAmount: money(data.pendingSettlementAmount),
      outstandingSettlementAmount: money(
        data.outstandingSettlementAmount ?? data.pendingSettlementAmount,
      ),
      nextSettlementAmount: moneyOrNull(data.nextSettlementAmount),
      nextSettlementId: data.nextSettlementId
        ? String(data.nextSettlementId)
        : null,
      nextSettlementNumber: data.nextSettlementNumber
        ? String(data.nextSettlementNumber)
        : null,
      totalCount: Number(data.totalCount) || 0,
      byStatus: Object.fromEntries(
        Object.entries(byStatusRaw).map(([key, value]) => [
          key,
          {
            count: Number(value.count) || 0,
            grossAmount: money(value.grossAmount),
            netAmount: money(value.netAmount),
          },
        ]),
      ),
    };
  });
}

export async function fetchSellerSettlement(
  id: string,
): Promise<SellerSettlementDetail> {
  return withSellerSession(async () =>
    mapDetail(
      unwrapData(
        await apiClient.get<Envelope<Record<string, unknown>>>(
          `/seller/settlements/${id}`,
        ),
      ),
    ),
  );
}

export async function fetchSellerSettlementTimeline(id: string) {
  return withSellerSession(async () => {
    const data = unwrapData(
      await apiClient.get<
        Envelope<{
          id: string;
          settlementNumber: string;
          status: string;
          timeline: SellerSettlementTimelineEvent[];
        }>
      >(`/seller/settlements/${id}/timeline`),
    );
    return {
      ...data,
      timeline: mapTimeline(data.timeline),
    };
  });
}

export async function fetchSellerPayments(): Promise<SellerPayment[]> {
  return withSellerSession(async () => {
    const response = await apiClient.get<Envelope<Array<Record<string, unknown>>>>(
      '/seller/payments',
      { params: { page: 1, limit: 100 } },
    );
    const items = Array.isArray(response.data.data) ? response.data.data : [];
    return items.map((item) => {
      const buyer = (item.buyer ?? {}) as Record<string, unknown>;
      return {
        id: String(item.id),
        paymentId: String(item.referenceNumber ?? item.id),
        orderId: String(item.purchaseOrderId ?? item.id),
        buyerRef: String(buyer.displayName ?? 'Anonymous Buyer'),
        amount: money(item.amount),
        date: String(item.createdAt ?? new Date().toISOString()),
        method: String(item.method ?? 'NEFT'),
        status: String(item.status ?? 'processing'),
        reference: String(item.utr ?? item.referenceNumber ?? item.id),
      };
    });
  });
}

export async function fetchSellerProformaInvoices(): Promise<SellerProformaInvoice[]> {
  return withSellerSession(async () => {
    try {
      const response = await apiClient.get<
        Envelope<Array<Record<string, unknown>>>
      >('/seller/proforma-invoices', { params: { page: 1, limit: 50 } });
      const items = Array.isArray(response.data.data) ? response.data.data : [];
      return items.map((item) => {
        const buyer = (item.buyer ?? {}) as Record<string, unknown>;
        return {
          id: String(item.id),
          piNumber: String(item.piNumber ?? item.referenceNumber ?? item.id),
          purchaseOrderId: item.purchaseOrderId
            ? String(item.purchaseOrderId)
            : null,
          status: String(item.status ?? 'DRAFT'),
          amount: money(item.totalAmount ?? item.amount),
          currency: String(item.currency ?? 'INR'),
          buyer: {
            displayName: String(buyer.displayName ?? 'Anonymous Buyer'),
            reference: String(buyer.reference ?? 'BUYER-UNKNOWN'),
          },
          createdAt: String(item.createdAt ?? new Date().toISOString()),
        };
      });
    } catch {
      return [];
    }
  });
}

export function settlementApiError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Unable to load settlements. Please try again.';
  }
  const err = error as {
    response?: { status?: number; data?: { message?: string; error?: string } };
    message?: string;
    code?: string;
  };
  const status = err.response?.status;
  const msg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    '';

  if (status === 401 || err.code === 'ERR_UNAUTHORIZED') {
    return 'Session expired. Please sign in again.';
  }
  if (status === 403) return "You don't have access to this settlement.";
  if (status === 404) return 'Settlement not found.';
  if (status === 409) return msg || 'Settlement conflict. Please refresh.';
  if (status === 422) return msg || 'Invalid settlement request.';
  return msg || 'Unable to load settlements. Please try again.';
}

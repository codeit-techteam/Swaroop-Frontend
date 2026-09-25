import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success?: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

const ANONYMOUS_BUYER = 'Anonymous Buyer';

export type ProcurementStage =
  | 'PURCHASE_REQUEST'
  | 'PRICE_REVISION'
  | 'ORDER_CONFIRMED'
  | 'AWAITING_PAYMENT'
  | 'READY_FOR_DISPATCH'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'SETTLEMENT'
  | string;

export type ProcurementPriority = 'HIGH' | 'MEDIUM' | 'LOW' | string;
export type PaymentStatus = string;
export type DispatchStatus = string;
export type AlertKind = string;

export type SellerWorkbenchItem = {
  id: string;
  purchaseRequestId: string;
  orderId?: string;
  priceRevisionId?: string;
  vehicleSlotId?: string;
  /** Blind buyer label only. */
  buyerDisplayName: string;
  productId: string;
  productName: string;
  gradeId: string;
  gradeName: string;
  quantityMt: number;
  currentStage: ProcurementStage;
  orderValue: number;
  paymentStatus: PaymentStatus;
  dispatchStatus: DispatchStatus;
  settlementStatus?: string;
  priority: ProcurementPriority;
  deliveryLocation: string;
  expectedDelivery: string;
  warehouseName?: string;
  paymentTerms: string;
  lastUpdated: string;
  overdue: boolean;
  delayed: boolean;
  poAcknowledged: boolean;
  documentsMissing: boolean;
  commercial: {
    originalPrice: number;
    requestedPrice: number;
    paymentTerms: string;
    deliveryTerms: string;
  };
  order: {
    poNumber?: string;
    orderNumber?: string;
    quantityMt: number;
    dispatchStatus: DispatchStatus;
  };
  payment: {
    method: string;
    status: PaymentStatus;
    amountPaid: number;
    amountPending: number;
    dueDate: string;
    orderValue: number;
  };
  fulfillment: {
    trackingStatus: DispatchStatus;
    vehicleSlotId?: string;
  };
  documents: unknown[];
  timeline: unknown[];
  activity: unknown[];
  alerts: AlertKind[];
};

export type SellerWorkbenchSummary = {
  kpis: {
    openPurchaseRequests: number;
    pendingPriceRevisions: number;
    confirmedOrders: number;
    awaitingPayment: number;
    readyForDispatch: number;
    inTransit: number;
    settlementPending: number;
  };
  pipeline: Record<string, number>;
  actionRequired: Record<string, number>;
  total: number;
};

export type SellerWorkbenchPage = {
  items: SellerWorkbenchItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SellerWorkbenchQuery = {
  page?: number;
  limit?: number;
  search?: string;
  stage?: ProcurementStage | 'ALL';
  gradeId?: string;
  priority?: ProcurementPriority | 'all';
  paymentStatus?: PaymentStatus | 'all';
  dispatchStatus?: DispatchStatus | 'all';
  alert?: AlertKind | 'ALL';
  date?: string;
  fromDate?: string;
  toDate?: string;
};

type SellerWorkbenchItemDto = {
  id: string;
  referenceId: string;
  purchaseRequestId: string;
  orderId?: string | null;
  priceRevisionId?: string | null;
  buyerDisplayName: string;
  productId?: string | null;
  productName: string;
  gradeId?: string | null;
  gradeName: string;
  quantity: number;
  quantityUnit?: string;
  currentStage: ProcurementStage;
  orderValue: number;
  currency?: string;
  paymentStatus: PaymentStatus;
  dispatchStatus: DispatchStatus;
  settlementStatus?: string | null;
  priority: ProcurementPriority;
  deliveryLocation?: string;
  expectedDelivery?: string | null;
  warehouseName?: string | null;
  paymentTerms?: string;
  lastUpdatedAt: string;
  overdue?: boolean;
  delayed?: boolean;
  poAcknowledged?: boolean;
  documentsMissing?: boolean;
  commercial?: SellerWorkbenchItem['commercial'];
  order?: SellerWorkbenchItem['order'];
  payment?: SellerWorkbenchItem['payment'];
  fulfillment?: SellerWorkbenchItem['fulfillment'];
  documents?: unknown[];
  timeline?: unknown[];
  activity?: unknown[];
  alerts?: AlertKind[];
};

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

function mapWorkbenchItem(raw: SellerWorkbenchItemDto): SellerWorkbenchItem {
  const quantityMt = Number(raw.quantity) || 0;
  const orderValue = Number(raw.orderValue) || 0;
  const paymentTerms = raw.paymentTerms || 'Other';

  return {
    id: raw.id,
    purchaseRequestId: raw.purchaseRequestId || raw.referenceId,
    orderId: raw.orderId ?? undefined,
    priceRevisionId: raw.priceRevisionId ?? undefined,
    vehicleSlotId: raw.fulfillment?.vehicleSlotId ?? undefined,
    buyerDisplayName: ANONYMOUS_BUYER,
    productId: raw.productId ?? '',
    productName: raw.productName,
    gradeId: raw.gradeId ?? '',
    gradeName: raw.gradeName,
    quantityMt,
    currentStage: raw.currentStage,
    orderValue,
    paymentStatus: raw.paymentStatus,
    dispatchStatus: raw.dispatchStatus,
    settlementStatus: raw.settlementStatus ?? undefined,
    priority: raw.priority,
    deliveryLocation: raw.deliveryLocation ?? 'Assigned destination',
    expectedDelivery: raw.expectedDelivery ?? new Date().toISOString(),
    warehouseName: raw.warehouseName ?? undefined,
    paymentTerms,
    lastUpdated: raw.lastUpdatedAt,
    overdue: Boolean(raw.overdue),
    delayed: Boolean(raw.delayed),
    poAcknowledged: Boolean(raw.poAcknowledged),
    documentsMissing: Boolean(raw.documentsMissing),
    commercial: raw.commercial ?? {
      originalPrice: 0,
      requestedPrice: 0,
      paymentTerms,
      deliveryTerms: raw.deliveryLocation ?? 'Assigned destination',
    },
    order: raw.order ?? {
      poNumber: raw.orderId ?? undefined,
      orderNumber: raw.orderId ?? undefined,
      quantityMt,
      dispatchStatus: raw.dispatchStatus,
    },
    payment: raw.payment ?? {
      method: paymentTerms,
      status: raw.paymentStatus,
      amountPaid: 0,
      amountPending: orderValue,
      dueDate: raw.expectedDelivery ?? new Date().toISOString(),
      orderValue,
    },
    fulfillment: raw.fulfillment ?? {
      trackingStatus: raw.dispatchStatus,
    },
    documents: raw.documents ?? [],
    timeline: raw.timeline ?? [],
    activity: raw.activity ?? [],
    alerts: raw.alerts ?? [],
  };
}

export async function fetchSellerProcurementWorkbench(
  params: SellerWorkbenchQuery = {},
): Promise<SellerWorkbenchPage> {
  return withSellerSession(async () => {
    const response = await apiClient.get<Envelope<SellerWorkbenchItemDto[]>>(
      '/seller/procurement/workbench',
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 100,
          search: params.search?.trim() || undefined,
          stage:
            params.stage && params.stage !== 'ALL' ? params.stage : undefined,
          gradeId: params.gradeId || undefined,
          priority:
            params.priority && params.priority !== 'all'
              ? params.priority
              : undefined,
          paymentStatus:
            params.paymentStatus && params.paymentStatus !== 'all'
              ? params.paymentStatus
              : undefined,
          dispatchStatus:
            params.dispatchStatus && params.dispatchStatus !== 'all'
              ? params.dispatchStatus
              : undefined,
          alert:
            params.alert && params.alert !== 'ALL' ? params.alert : undefined,
          date: params.date || undefined,
          fromDate: params.fromDate || undefined,
          toDate: params.toDate || undefined,
        },
      },
    );

    const items = Array.isArray(response.data.data)
      ? response.data.data.map(mapWorkbenchItem)
      : [];
    const meta = response.data.meta ?? {};

    return {
      items,
      meta: {
        page: meta.page ?? params.page ?? 1,
        limit: meta.limit ?? params.limit ?? 100,
        total: meta.total ?? items.length,
        totalPages: meta.totalPages ?? 1,
      },
    };
  });
}

export async function fetchSellerProcurementWorkbenchSummary(): Promise<SellerWorkbenchSummary> {
  return withSellerSession(async () => {
    const response = await apiClient.get<Envelope<SellerWorkbenchSummary>>(
      '/seller/procurement/workbench/summary',
    );
    return response.data.data;
  });
}

export async function fetchSellerProcurementWorkbenchDetail(
  id: string,
): Promise<SellerWorkbenchItem> {
  return withSellerSession(async () => {
    const response = await apiClient.get<Envelope<SellerWorkbenchItemDto>>(
      `/seller/procurement/workbench/${id}`,
    );
    return mapWorkbenchItem(response.data.data);
  });
}

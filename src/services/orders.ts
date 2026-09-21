import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import { createInitialOrderFields } from '@/constants/orderWorkflow';
import { syncOrderDerivedFields } from '@/constants/orderStatus';
import type { PlacePurchaseRequestResult } from '@/types/checkout-quote';
import type { Order, ProductCategory } from '@/types/order';
import type { PaymentMethodId } from '@/types/payment';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { totalPages?: number; total?: number };
};

export type BackendCustomerOrder = {
  id: string;
  orderNumber: string;
  purchaseOrderId: string;
  purchaseRequestId?: string | null;
  status: string;
  backendStatus?: string;
  presentationBucket?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  confirmedAt?: string | null;
  currency?: string;
  productName?: string;
  gradeName?: string;
  categoryCode?: string | null;
  categoryName?: string | null;
  quantity?: number;
  unit?: string;
  items?: Array<{
    productName?: string;
    gradeName?: string;
    categoryCode?: string | null;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    totalAmount?: number;
  }>;
  payment?: {
    paymentOption?: string | null;
    paymentOptionLabel?: string;
    paymentStatus?: string;
    amountPaid?: string;
    amountDue?: string;
    verifiedByPetroTrade?: boolean;
    creditStatus?: string | null;
  };
  progress?: {
    percentage?: number;
    stage?: string;
    status?: string;
    label?: string;
  };
  procurement?: { status?: string | null };
  dispatch?: { status?: string | null };
  shipment?: {
    status?: string | null;
    estimatedDeliveryDate?: string | null;
  };
  delivery?: { status?: string | null; deliveredAt?: string | null };
  amounts?: {
    subtotal?: string;
    taxAmount?: string;
    totalAmount?: string;
  };
};

type BackendPurchaseOrderLegacy = {
  id: string;
  referenceNumber: string;
  status: string;
  paymentMethod?: string | null;
  currency?: string;
  totalAmount?: string | number | null;
  createdAt?: string;
};

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapPaymentMethod(value?: string | null): PaymentMethodId {
  const key = (value ?? '').toUpperCase();
  if (key.includes('LOAD')) return 'on_loading';
  if (key.includes('DELIV')) return 'on_delivery';
  if (key.includes('30')) return 'credit_30';
  if (key.includes('CREDIT')) return 'credit_15';
  return 'advance';
}

function mapCategory(code?: string | null): ProductCategory {
  const key = (code ?? '').toUpperCase();
  if (key.includes('PVC')) return 'PVC';
  if (key.includes('HDPE')) return 'HDPE';
  if (key.includes('LLDPE')) return 'LLDPE';
  if (key.includes('PET')) return 'PET';
  return 'PP';
}

function mapLifecycleFromBackend(order: BackendCustomerOrder): Order['status'] {
  const bucket = order.presentationBucket;
  const stage = (order.progress?.stage ?? order.status ?? '').toUpperCase();
  if (bucket === 'CANCELLED') return 'ORDER_CREATED';
  if (bucket === 'COMPLETED' || stage.includes('DELIVER')) return 'DELIVERED';
  if (stage.includes('DISPATCH') || stage.includes('TRANSIT')) return 'DISPATCH_STARTED';
  if (stage.includes('PAYMENT')) return 'PAYMENT_PENDING';
  if (stage.includes('LOAD')) return 'LOADING_COMPLETED';
  if (stage.includes('PROCURE')) return 'PROCUREMENT_STARTED';
  return 'ORDER_CREATED';
}

function mapPaymentStatus(
  payment?: BackendCustomerOrder['payment'],
): Order['paymentStatus'] {
  if (payment?.verifiedByPetroTrade) return 'verified';
  const key = (payment?.paymentStatus ?? '').toUpperCase();
  if (key === 'VERIFIED' || key === 'PAID' || key === 'AUTHORIZED') return 'verified';
  if (key === 'SUBMITTED' || key === 'UNDER_VERIFICATION') return 'submitted';
  if (key === 'FAILED' || key === 'REJECTED') return 'failed';
  return 'pending';
}

export function mapCustomerOrderToOrder(item: BackendCustomerOrder): Order {
  const primary = item.items?.[0];
  const paymentMethodId = mapPaymentMethod(
    item.payment?.paymentOption ?? item.payment?.paymentOptionLabel,
  );
  const amount = num(item.amounts?.totalAmount ?? primary?.totalAmount);
  const quantity = num(item.quantity ?? primary?.quantity);
  const status = mapLifecycleFromBackend(item);
  const paymentStatus = mapPaymentStatus(item.payment);
  const cancelled = item.presentationBucket === 'CANCELLED';
  const delivered = item.presentationBucket === 'COMPLETED';
  const progress = num(item.progress?.percentage) || (delivered ? 100 : 20);
  const shipmentKey = (item.shipment?.status ?? item.dispatch?.status ?? '').toUpperCase();
  const inTransit =
    shipmentKey.includes('TRANSIT') ||
    shipmentKey.includes('DISPATCH') ||
    shipmentKey.includes('OUT_FOR');

  const mapped = syncOrderDerivedFields({
    ...createInitialOrderFields(),
    id: item.id,
    productName: item.productName ?? primary?.productName ?? item.orderNumber,
    grade: item.gradeName ?? primary?.gradeName ?? '—',
    productCategory: mapCategory(item.categoryCode ?? primary?.categoryCode),
    quantityMt: quantity,
    warehouse: 'Assigned hub',
    destination: '',
    eta: item.shipment?.estimatedDeliveryDate ?? null,
    progress,
    shipmentStatus: cancelled
      ? 'cancelled'
      : delivered
        ? 'delivered'
        : inTransit
          ? 'in_transit'
          : 'processing',
    insuranceCovered: false,
    isMasterShipment: false,
    documents: [],
    amount,
    paymentMethod: item.payment?.paymentOptionLabel ?? paymentMethodId.replaceAll('_', ' '),
    paymentMethodId,
    paymentStatus,
    verificationStatus: paymentStatus === 'verified' ? 'verified' : 'none',
    procurement: null,
    paymentVerifiedAt: paymentStatus === 'verified' ? item.confirmedAt ?? item.createdAt : null,
    orderStatus: 'purchase_order_generated',
    priceLockStatus: 'active',
    priceLockStartedAt: item.createdAt,
    priceLockDurationSeconds: 0,
    validationTimeline: null,
    confirmationStatus: 'confirmed',
    supplierConfirmation: 'confirmed',
    inventoryReserved: true,
    poNumber: item.orderNumber,
    poGenerated: true,
    procurementCompleted: Boolean(item.procurement?.status),
    dispatchStatus:
      inTransit || delivered || (item.progress?.stage ?? '').toUpperCase() === 'DISPATCH'
        ? 'shipment_started'
        : null,
    documentsReady: false,
    workflowTimeline: null,
    dispatchReadiness: item.progress?.label ?? null,
    transitWindow: null,
    createdAt: item.createdAt,
    status,
    currentStep: status,
    credit: null,
  });

  // Prefer authoritative backend progress / payment verification over client derivation
  return {
    ...mapped,
    progress,
    paymentStatus,
    verificationStatus: paymentStatus === 'verified' ? 'verified' : mapped.verificationStatus,
    paymentMethod: item.payment?.paymentOptionLabel ?? mapped.paymentMethod,
    poNumber: item.orderNumber,
    dispatchReadiness: item.progress?.label ?? mapped.dispatchReadiness,
  };
}

/** @deprecated Prefer mapCustomerOrderToOrder / fetchCustomerOrders */
export function mapPurchaseRequestToOrder(item: PlacePurchaseRequestResult): Order {
  const statusKey = (item.status ?? '').toUpperCase();
  const cancelled = /CANCEL|REJECT|EXPIRED|WITHDRAWN/.test(statusKey);
  const converted = statusKey.includes('CONVERTED') || statusKey.includes('APPROVED');
  const item0 = item.items?.[0];
  const quantity = num(item0?.quantity ?? item.commercial?.quantity);
  const amount = num(item.commercial?.totalAmount ?? item.targetPrice);
  const paymentMethodId = mapPaymentMethod(item.paymentMethod ?? item.commercial?.paymentOption);
  return syncOrderDerivedFields({
    ...createInitialOrderFields(),
    id: item.id,
    productName: item0?.product?.name ?? item.referenceNumber,
    grade: item0?.grade?.displayName ?? item0?.grade?.name ?? item0?.grade?.code ?? '—',
    productCategory: 'PP',
    quantityMt: quantity,
    warehouse: 'Assigned hub',
    destination: '',
    eta: null,
    progress: converted ? 35 : 20,
    shipmentStatus: cancelled ? 'cancelled' : 'processing',
    insuranceCovered: false,
    isMasterShipment: false,
    documents: [],
    amount,
    paymentMethod: paymentMethodId.replaceAll('_', ' '),
    paymentMethodId,
    paymentStatus: 'pending',
    verificationStatus: 'none',
    procurement: null,
    paymentVerifiedAt: null,
    orderStatus: converted ? 'purchase_order_generated' : 'draft',
    priceLockStatus: 'active',
    priceLockStartedAt: null,
    priceLockDurationSeconds: 0,
    validationTimeline: null,
    confirmationStatus: 'pending_petrotrade',
    supplierConfirmation: 'pending',
    inventoryReserved: false,
    poNumber: item.referenceNumber,
    poGenerated: converted,
    procurementCompleted: false,
    dispatchStatus: null,
    documentsReady: false,
    workflowTimeline: null,
    dispatchReadiness: null,
    transitWindow: null,
    createdAt: new Date().toISOString(),
    status: converted ? 'PROCUREMENT_STARTED' : 'SUPPLIER_MATCHING',
    currentStep: converted ? 'PROCUREMENT_STARTED' : 'SUPPLIER_MATCHING',
    credit: null,
  });
}

/** @deprecated Prefer mapCustomerOrderToOrder */
export function mapPurchaseOrderToOrder(item: BackendPurchaseOrderLegacy): Order {
  return mapCustomerOrderToOrder({
    id: item.id,
    orderNumber: item.referenceNumber,
    purchaseOrderId: item.id,
    status: item.status,
    createdAt: item.createdAt ?? new Date().toISOString(),
    payment: {
      paymentOption: item.paymentMethod,
      paymentStatus: 'PENDING',
    },
    amounts: { totalAmount: String(item.totalAmount ?? 0) },
    progress: { percentage: 20, stage: 'PLACED' },
    presentationBucket: item.status.toUpperCase().includes('CANCEL')
      ? 'CANCELLED'
      : item.status.toUpperCase().includes('DELIVER')
        ? 'COMPLETED'
        : 'ACTIVE',
  });
}

export async function fetchCustomerOrders(params?: {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}): Promise<Order[]> {
  await ensureDevBackendSession('customer');
  const pages: Order[] = [];
  let page = 1;
  let totalPages = 1;
  const statusQuery = params?.status ? `&status=${params.status}` : '';
  do {
    const payload = await apiClient.get<Envelope<BackendCustomerOrder[]>>(
      `/customer/orders?page=${page}&limit=50${statusQuery}`,
    );
    pages.push(...(payload.data.data ?? []).map(mapCustomerOrderToOrder));
    totalPages = payload.data.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  return pages;
}

/** Backward-compatible alias used by older callers. */
export async function fetchCustomerPurchaseOrders(): Promise<Order[]> {
  return fetchCustomerOrders();
}

export async function fetchCustomerOrderById(id: string): Promise<Order | null> {
  await ensureDevBackendSession('customer');
  try {
    const payload = await apiClient.get<Envelope<BackendCustomerOrder>>(
      `/customer/orders/${id}`,
    );
    return mapCustomerOrderToOrder(payload.data.data);
  } catch {
    return null;
  }
}

export async function fetchCustomerOrderTimeline(id: string) {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<
    Envelope<{ events: Array<{ at: string; type: string; label: string }> }>
  >(`/customer/orders/${id}/timeline`);
  return payload.data.data;
}

export async function fetchCustomerOrdersSummary() {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<
    Envelope<{
      activeOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      pendingPayments: number;
      inTransit: number;
    }>
  >('/customer/orders/summary');
  return payload.data.data;
}

export async function fetchCustomerFinanceSummary() {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<
    Envelope<{ outstandingAmount?: string; dueScheduleCount?: number }>
  >('/customer/finance/summary');
  return payload.data.data;
}

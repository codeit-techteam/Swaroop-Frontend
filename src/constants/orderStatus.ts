import type {
  Order,
  OrderDisplayStatus,
  OrderShipmentStage,
  OrderTabCategory,
  ProductCategory,
} from '@/types/order';
import type { OrderStatus } from '@/types/orderStatus';
import type { DispatchStatus } from '@/types/purchaseOrder';
import { isPostDeliveryPaymentPending } from '@/constants/deliveryCompleted';
import {
  isCreditOrderCompleted,
  isCreditPaymentFlow,
  isCreditPaymentPending,
} from '@/constants/creditWorkflow';
import {
  inferOrderStatus,
  ORDER_STATUS_BADGE_LABELS,
  ORDER_STATUS_PROGRESS,
} from '@/constants/orderWorkflow';
import { brandColors } from '@/theme/colors';

export type OrderLifecycleStage =
  | 'placed'
  | 'procurement'
  | 'loading'
  | 'payment'
  | 'dispatch'
  | 'delivery';

export const ORDER_SHIPMENT_STAGES: OrderShipmentStage[] = [
  'placed',
  'dispatched',
  'transit',
  'delivered',
];

export const ORDER_LIFECYCLE_STAGES: OrderLifecycleStage[] = [
  'placed',
  'procurement',
  'loading',
  'payment',
  'dispatch',
  'delivery',
];

export const ORDER_LIFECYCLE_STAGE_LABELS: Record<OrderLifecycleStage, string> = {
  placed: 'Placed',
  procurement: 'Procurement',
  loading: 'Loading',
  payment: 'Payment',
  dispatch: 'Dispatch',
  delivery: 'Delivery',
};

export const ORDER_LIFECYCLE_PROGRESS_MAP: Record<OrderLifecycleStage, number> = {
  placed: 17,
  procurement: 33,
  loading: 50,
  payment: 67,
  dispatch: 83,
  delivery: 100,
};

export const ORDER_SHIPMENT_STAGE_LABELS: Record<OrderShipmentStage, string> = {
  placed: 'PLACED',
  dispatched: 'DISPATCHED',
  transit: 'TRANSIT',
  delivered: 'DELIVERY',
};

export const ORDER_TAB_LABELS: Record<OrderTabCategory, string> = {
  active: 'Active Orders',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_FILTER_STATUS_OPTIONS: OrderDisplayStatus[] = [
  'processing',
  'in_transit',
  'delivered',
  'cancelled',
];

export const ORDER_FILTER_DATE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_month', label: 'Last Month' },
] as const;

export type OrderDateFilterId = (typeof ORDER_FILTER_DATE_OPTIONS)[number]['id'];

export const ORDER_FILTER_PRODUCT_OPTIONS: ProductCategory[] = [
  'PP',
  'PVC',
  'HDPE',
  'LLDPE',
  'PET',
];

export type OrderStatusBadgeConfig = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

const DISPATCH_STAGE_MAP: Record<DispatchStatus, OrderShipmentStage> = {
  planning: 'placed',
  vehicle_allocation: 'dispatched',
  driver_assigned: 'dispatched',
  shipment_ready: 'dispatched',
  shipment_started: 'transit',
  delivered: 'delivered',
};

export const deriveOrderDisplayStatus = (order: Order): OrderDisplayStatus => {
  if (order.shipmentStatus === 'cancelled') {
    return 'cancelled';
  }

  if (order.dispatchStatus === 'delivered' || order.shipmentStatus === 'delivered') {
    return 'delivered';
  }

  if (order.dispatchStatus === 'shipment_started' || order.shipmentStatus === 'in_transit') {
    return 'in_transit';
  }

  return 'processing';
};

export const deriveOrderProgress = (order: Order): number => {
  const status = inferOrderStatus(order);
  const statusProgress = ORDER_STATUS_PROGRESS[status];

  if (order.trackingAvailable && order.dispatchProgress) {
    return Math.max(statusProgress, order.dispatchProgress);
  }

  if (order.progress > 0 && order.progress >= statusProgress) {
    return order.progress;
  }

  return statusProgress;
};

export const deriveOrderLifecycleStage = (order: Order): OrderLifecycleStage => {
  const status = inferOrderStatus(order);

  switch (status) {
    case 'DELIVERED':
      return 'delivery';
    case 'DELIVERY_COMPLETED':
      return 'delivery';
    case 'DISPATCH_STARTED':
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return 'dispatch';
    case 'PAYMENT_VERIFIED':
    case 'PAYMENT_PENDING':
      return 'payment';
    case 'LOADING_SCHEDULED':
    case 'LOADING_COMPLETED':
      return 'loading';
    case 'PROCUREMENT_STARTED':
    case 'SUPPLIER_MATCHING':
      return 'procurement';
    default:
      return 'placed';
  }
};

export const deriveOrderLifecycleProgress = (order: Order): number => {
  const stage = deriveOrderLifecycleStage(order);
  return ORDER_LIFECYCLE_PROGRESS_MAP[stage];
};

export const deriveOrderShipmentStage = (order: Order): OrderShipmentStage => {
  const status = deriveOrderDisplayStatus(order);

  if (status === 'delivered') {
    return 'delivered';
  }

  if (status === 'in_transit') {
    return 'transit';
  }

  if (order.dispatchStatus) {
    return DISPATCH_STAGE_MAP[order.dispatchStatus];
  }

  return 'placed';
};

export const getOrderTabCategory = (order: Order): OrderTabCategory => {
  const status = deriveOrderDisplayStatus(order);

  if (status === 'cancelled') {
    return 'cancelled';
  }

  if (isCreditPaymentFlow(order)) {
    if (isCreditOrderCompleted(order)) {
      return 'completed';
    }
    return 'active';
  }

  if (isPostDeliveryPaymentPending(order) || inferOrderStatus(order) === 'DELIVERY_COMPLETED') {
    return 'active';
  }

  if (status === 'delivered') {
    return 'completed';
  }

  return 'active';
};

export const getOrderStatusBadgeConfig = (status: OrderDisplayStatus): OrderStatusBadgeConfig => {
  switch (status) {
    case 'processing':
      return {
        label: 'PROCESSING',
        backgroundColor: '#FFEDD5',
        textColor: '#C2410C',
      };
    case 'in_transit':
      return {
        label: 'IN TRANSIT',
        backgroundColor: brandColors.successLight,
        textColor: brandColors.success,
      };
    case 'delivered':
      return {
        label: 'DELIVERED',
        backgroundColor: brandColors.successLight,
        textColor: brandColors.success,
      };
    case 'cancelled':
      return {
        label: 'CANCELLED',
        backgroundColor: brandColors.errorLight,
        textColor: brandColors.error,
      };
    default:
      return {
        label: 'PROCESSING',
        backgroundColor: '#FFEDD5',
        textColor: '#C2410C',
      };
  }
};

export const getOrderProgressColor = (order: Order): string => {
  const status = deriveOrderDisplayStatus(order);

  if (status === 'delivered') {
    return brandColors.primary;
  }

  if (status === 'in_transit') {
    return brandColors.success;
  }

  if (status === 'cancelled') {
    return brandColors.muted;
  }

  return brandColors.primary;
};

export const getOrderProgressLabel = (order: Order): string => {
  const status = inferOrderStatus(order);
  const badgeLabel = ORDER_STATUS_BADGE_LABELS[status];

  if (status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY') {
    return order.eta ? `In Transit — Arriving ${order.eta}` : badgeLabel;
  }

  if (status === 'DELIVERED' || status === 'DELIVERY_COMPLETED') {
    return 'Delivered Successfully';
  }

  if (order.dispatchReadiness) {
    return order.dispatchReadiness;
  }

  return badgeLabel;
};

export const getOrderStatusBadgeConfigFromOrder = (order: Order): OrderStatusBadgeConfig => {
  const status = inferOrderStatus(order);

  if (isCreditPaymentPending(order)) {
    return {
      label: 'PAYMENT PENDING',
      backgroundColor: '#FEF3C7',
      textColor: '#B45309',
    };
  }

  if (isCreditOrderCompleted(order)) {
    return {
      label: 'COMPLETED',
      backgroundColor: brandColors.successLight,
      textColor: brandColors.success,
    };
  }

  if (order.paymentMethodId === 'credit_15' || order.paymentMethodId === 'credit_30') {
    if (order.paymentStatus === 'verified' && order.credit?.workflowPhase === 'completed') {
      return {
        label: 'PAID',
        backgroundColor: brandColors.successLight,
        textColor: brandColors.success,
      };
    }
  }

  if (status === 'DELIVERY_COMPLETED' || isPostDeliveryPaymentPending(order)) {
    return {
      label: 'DELIVERED',
      backgroundColor: '#FFEDD5',
      textColor: '#C2410C',
    };
  }

  const label = ORDER_STATUS_BADGE_LABELS[status].toUpperCase();

  switch (status) {
    case 'DELIVERED':
      return {
        label,
        backgroundColor: brandColors.successLight,
        textColor: brandColors.success,
      };
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return {
        label,
        backgroundColor: brandColors.successLight,
        textColor: brandColors.success,
      };
    case 'DISPATCH_STARTED':
      return {
        label,
        backgroundColor: '#DBEAFE',
        textColor: '#1D4ED8',
      };
    case 'PAYMENT_VERIFIED':
      return {
        label,
        backgroundColor: brandColors.successLight,
        textColor: brandColors.success,
      };
    case 'PAYMENT_PENDING':
      return {
        label,
        backgroundColor: '#FEF3C7',
        textColor: '#B45309',
      };
    default:
      return {
        label,
        backgroundColor: '#FFEDD5',
        textColor: '#C2410C',
      };
  }
};

export const getCanonicalOrderStatus = (order: Order): OrderStatus => inferOrderStatus(order);

export const formatOrderNumber = (orderId: string, poNumber?: string | null): string => {
  if (poNumber?.trim()) {
    const ref = poNumber.trim().replace(/^#/, '');
    return ref.startsWith('PO-') || ref.startsWith('ORD-') || ref.startsWith('PR-')
      ? `#${ref}`
      : `#${ref}`;
  }
  // Prefer short UUID suffix only when PO number is unavailable
  const short = orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `#PO-${short}`;
};

export const formatOrderDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
};

export const syncOrderDerivedFields = (order: Order): Order => {
  const canonicalStatus = inferOrderStatus(order);
  const shipmentStatus = deriveOrderDisplayStatus(order);
  const progress = deriveOrderProgress(order);

  return {
    ...order,
    status: canonicalStatus,
    currentStep: canonicalStatus,
    shipmentStatus,
    progress,
  };
};

export const isWithinDateFilter = (
  createdAt: string,
  filter: OrderDateFilterId | null,
): boolean => {
  if (!filter) {
    return true;
  }

  const created = new Date(createdAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return created >= startOfToday;
    case 'last_7_days': {
      const weekAgo = new Date(startOfToday);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }
    case 'last_month': {
      const monthAgo = new Date(startOfToday);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return created >= monthAgo;
    }
    default:
      return true;
  }
};

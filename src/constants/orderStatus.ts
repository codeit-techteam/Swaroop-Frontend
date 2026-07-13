import type {
  Order,
  OrderDisplayStatus,
  OrderShipmentStage,
  OrderTabCategory,
  ProductCategory,
} from '@/types/order';
import type { DispatchStatus } from '@/types/purchaseOrder';
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

const DISPATCH_PROGRESS_MAP: Record<DispatchStatus, number> = {
  planning: 15,
  vehicle_allocation: 25,
  driver_assigned: 35,
  shipment_ready: 50,
  shipment_started: 75,
  delivered: 100,
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
  if (order.trackingAvailable && order.dispatchProgress) {
    return Math.max(deriveOrderLifecycleProgress(order), order.dispatchProgress);
  }

  if (order.progress > 0) {
    return order.progress;
  }

  if (order.dispatchStatus) {
    return DISPATCH_PROGRESS_MAP[order.dispatchStatus];
  }

  if (order.paymentStatus === 'verified') {
    return ORDER_LIFECYCLE_PROGRESS_MAP.payment;
  }

  return ORDER_LIFECYCLE_PROGRESS_MAP.placed;
};

export const deriveOrderLifecycleStage = (order: Order): OrderLifecycleStage => {
  if (order.dispatchStatus === 'delivered' || order.shipmentStatus === 'delivered') {
    return 'delivery';
  }

  if (
    order.orderStatus === 'dispatch_started' ||
    order.dispatchStatus === 'shipment_started' ||
    order.trackingAvailable
  ) {
    return 'dispatch';
  }

  if (order.paymentStatus === 'verified') {
    return 'payment';
  }

  if (
    order.dispatchStatus === 'shipment_ready' ||
    order.workflowTimeline?.completedSteps.includes('shipment_ready')
  ) {
    return 'loading';
  }

  if (order.procurementCompleted || order.poGenerated) {
    return 'procurement';
  }

  return 'placed';
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
  const status = deriveOrderDisplayStatus(order);

  if (status === 'in_transit') {
    return order.eta ? `In Transit — Arriving ${order.eta}` : 'In Transit';
  }

  if (status === 'delivered') {
    return 'Delivered Successfully';
  }

  if (order.dispatchStatus === 'shipment_ready') {
    return 'Ready for Dispatch';
  }

  return 'Preparing for Dispatch';
};

export const formatOrderNumber = (orderId: string): string => {
  const normalized = orderId.replace(/^PT-ORD-/, '');
  return `#ORD-${normalized}`;
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
  const shipmentStatus = deriveOrderDisplayStatus(order);
  const progress = deriveOrderProgress(order);

  return {
    ...order,
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

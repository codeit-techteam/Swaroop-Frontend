import { STORAGE_KEYS } from '@/constants';
import { syncOrderDerivedFields } from '@/constants/orderStatus';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import type { Order } from '@/types/order';

import type {
  DispatchChecklistItem,
  DispatchDocument,
  DispatchDriver,
  DispatchHistoryEntry,
  DispatchOrder,
  DispatchSnapshot,
  DispatchStage,
  DispatchSummary,
  DispatchVehicle,
} from '@/seller/modules/dispatch/types/dispatch';
import {
  fetchSellerDispatchesPage,
  type SellerDispatchRecord,
} from '@/services/seller-dispatches';
import { logger } from '@/utils/logger';

type DispatchSeed = {
  orders: DispatchOrder[];
  vehicles: DispatchVehicle[];
  drivers: DispatchDriver[];
};

const dispatchSeed = require('@/seller/modules/dispatch/mock/dispatch.json') as DispatchSeed;

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

const sortOrders = (orders: DispatchOrder[]): DispatchOrder[] =>
  [...orders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

const nowIso = (): string => new Date().toISOString();

const stageProgressMap: Record<DispatchStage, number> = {
  ready_to_dispatch: 58,
  invoice_generated: 64,
  vehicle_assigned: 70,
  loading: 76,
  dispatch_ready: 84,
  dispatched: 88,
  in_transit: 92,
  delivered: 100,
  delayed: 81,
};

const isReadyBucket = (stage: DispatchStage): boolean =>
  stage === 'ready_to_dispatch' ||
  stage === 'invoice_generated' ||
  stage === 'vehicle_assigned' ||
  stage === 'loading' ||
  stage === 'dispatch_ready';

export const buildDispatchSummary = (orders: DispatchOrder[]): DispatchSummary => ({
  readyToDispatch: orders.filter((order) => isReadyBucket(order.stage)).length,
  inTransit: orders.filter(
    (order) => order.stage === 'dispatched' || order.stage === 'in_transit',
  ).length,
  delivered: orders.filter((order) => order.stage === 'delivered').length,
  delayed: orders.filter((order) => order.stage === 'delayed').length,
});

const getChecklistState = (
  order: DispatchOrder,
  key: DispatchChecklistItem['key'],
): DispatchChecklistItem['state'] => {
  switch (key) {
    case 'payment_verified':
      return order.paymentStatus === 'verified' ? 'done' : 'pending';
    case 'invoice_generated':
      return order.invoiceNumber ? 'done' : 'required';
    case 'eway_bill_ready':
      return order.eWayBillReady ? 'done' : 'required';
    case 'vehicle_assigned':
      return order.vehicleNumber ? 'done' : 'required';
    case 'loading_completed':
      return order.loadingCompletedAt ? 'done' : order.invoiceNumber && order.vehicleNumber ? 'required' : 'pending';
    case 'quality_check':
      return order.qualityApproved ? 'done' : 'pending';
    case 'dispatch_approved':
      return order.dispatchApproved ? 'done' : order.loadingCompletedAt ? 'required' : 'pending';
    default:
      return 'pending';
  }
};

const checklistTemplate: { key: DispatchChecklistItem['key']; label: string }[] = [
  { key: 'payment_verified', label: 'Payment Verified' },
  { key: 'invoice_generated', label: 'Invoice Generated' },
  { key: 'eway_bill_ready', label: 'E-Way Bill Ready' },
  { key: 'vehicle_assigned', label: 'Vehicle Assigned' },
  { key: 'loading_completed', label: 'Loading Completed' },
  { key: 'quality_check', label: 'Quality Check' },
  { key: 'dispatch_approved', label: 'Dispatch Approved' },
];

export const buildChecklistForOrder = (order: DispatchOrder): DispatchChecklistItem[] =>
  checklistTemplate.map((item) => ({
    ...item,
    state: getChecklistState(order, item.key),
  }));

export const buildDocumentsForOrder = (order: DispatchOrder): DispatchDocument[] => [
  {
    id: `${order.id}-invoice`,
    orderId: order.id,
    type: 'invoice',
    name: `Order_${order.id.replace('PT-', '')}_Invoice.pdf`,
    size: '2.4 MB',
    uploadedAt: order.invoiceGeneratedAt
      ? new Date(order.invoiceGeneratedAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Pending',
    status: order.invoiceNumber ? 'ready' : 'pending',
  },
  {
    id: `${order.id}-quality`,
    orderId: order.id,
    type: 'quality_certificate',
    name: 'Quality_Certificate.pdf',
    size: '1.1 MB',
    uploadedAt: 'Uploaded 1h ago',
    status: 'ready',
  },
  {
    id: `${order.id}-loading`,
    orderId: order.id,
    type: 'loading_slip',
    name: 'Loading_Slip.pdf',
    size: '1.8 MB',
    uploadedAt: order.loadingCompletedAt ? 'Uploaded 32m ago' : 'Pending',
    status: order.loadingCompletedAt ? 'ready' : 'pending',
  },
  {
    id: `${order.id}-eway`,
    orderId: order.id,
    type: 'eway_bill',
    name: 'E_Way_Bill.pdf',
    size: '840 KB',
    uploadedAt: order.eWayBillReady ? 'Uploaded 18m ago' : 'Pending',
    status: order.eWayBillReady ? 'ready' : 'pending',
  },
  {
    id: `${order.id}-dispatch-note`,
    orderId: order.id,
    type: 'dispatch_note',
    name: 'Dispatch_Note.pdf',
    size: '970 KB',
    uploadedAt: order.dispatchApproved ? 'Uploaded 12m ago' : 'Pending',
    status: order.dispatchApproved ? 'ready' : 'pending',
  },
];

const buildHistoryForOrder = (order: DispatchOrder): DispatchHistoryEntry[] => {
  const entries: DispatchHistoryEntry[] = [
    {
      id: `${order.id}-payment`,
      orderId: order.id,
      title: 'Payment Verified',
      subtitle: 'Settlement approved for dispatch processing.',
      timestamp: order.createdAt,
    },
  ];

  if (order.invoiceGeneratedAt) {
    entries.push({
      id: `${order.id}-invoice`,
      orderId: order.id,
      title: 'Invoice Generated',
      subtitle: order.invoiceNumber ?? 'Invoice document prepared.',
      timestamp: order.invoiceGeneratedAt,
    });
  }
  if (order.vehicleNumber) {
    entries.push({
      id: `${order.id}-vehicle`,
      orderId: order.id,
      title: 'Vehicle Assigned',
      subtitle: `${order.vehicleNumber} • ${order.driverName ?? 'Driver assigned'}`,
      timestamp: order.updatedAt,
    });
  }
  if (order.loadingCompletedAt) {
    entries.push({
      id: `${order.id}-loading`,
      orderId: order.id,
      title: 'Loading Completed',
      subtitle: 'Loading slip generated and checklist updated.',
      timestamp: order.loadingCompletedAt,
    });
  }
  if (order.dispatchStartedAt) {
    entries.push({
      id: `${order.id}-dispatch`,
      orderId: order.id,
      title: 'Shipment Dispatched',
      subtitle: 'Truck departed from loading point.',
      timestamp: order.dispatchStartedAt,
    });
  }
  if (order.deliveredAt) {
    entries.push({
      id: `${order.id}-delivered`,
      orderId: order.id,
      title: 'Shipment Delivered',
      subtitle: 'Proof of delivery acknowledged.',
      timestamp: order.deliveredAt,
    });
  }

  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

export const normalizeDispatchOrder = (
  order: DispatchOrder & { customerName?: string },
): DispatchOrder => {
  let stage = order.stage;
  if (order.delayed) {
    stage = 'delayed';
  } else if (order.deliveredAt) {
    stage = 'delivered';
  } else if (order.dispatchStartedAt) {
    stage = order.stage === 'dispatched' ? 'dispatched' : 'in_transit';
  } else if (order.loadingCompletedAt) {
    stage = 'dispatch_ready';
  } else if (order.invoiceNumber && order.vehicleNumber) {
    stage = 'loading';
  } else if (order.vehicleNumber) {
    stage = 'vehicle_assigned';
  } else if (order.invoiceNumber) {
    stage = 'invoice_generated';
  }

  const { customerName, ...rest } = order;
  return {
    ...rest,
    buyerLabel: order.buyerLabel || customerName || 'Anonymous Buyer',
    stage,
    progress: stageProgressMap[stage],
  };
};

const mapBackendStatusToStage = (status: string): DispatchStage => {
  switch (status.toUpperCase()) {
    case 'DISPATCHED':
      return 'dispatched';
    case 'LOADING':
    case 'LOADED':
      return 'loading';
    case 'READY_FOR_DISPATCH':
      return 'dispatch_ready';
    case 'VEHICLE_ASSIGNED':
      return 'vehicle_assigned';
    case 'AWAITING_EWAY_BILL':
    case 'PLANNED':
      return 'invoice_generated';
    case 'CANCELLED':
      return 'delayed';
    default:
      return 'ready_to_dispatch';
  }
};

export const mapSellerDispatchRecordToOrder = (
  record: SellerDispatchRecord,
): DispatchOrder => {
  const stage = mapBackendStatusToStage(record.status);
  const timestamp = record.updatedAt || record.createdAt;
  return normalizeDispatchOrder({
    id: record.dispatchNumber || record.id,
    buyerLabel: record.buyer?.displayName || 'Anonymous Buyer',
    material: record.gradeName || 'Material',
    quantityMt: record.quantity,
    eta: record.plannedDispatchDate
      ? new Date(record.plannedDispatchDate).toLocaleString('en-IN', {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Pending scheduling',
    orderDateTime: new Date(timestamp).toLocaleString('en-IN', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    amount: 0,
    gstAmount: 0,
    destination: record.destinationRegion || 'Assigned destination',
    loadingPoint: record.warehouseName || record.loadingLocation || 'Assigned hub',
    vehicleNumber: record.vehicleNumber,
    vehicleType: record.vehicleType,
    driverName: record.driverName,
    driverPhone: record.driverPhone,
    driverId: record.driverId,
    vehicleId: record.vehicleId,
    vehicleCapacity: null,
    paymentStatus: 'pending',
    vehicleStatus: record.vehicleNumber ? 'assigned' : 'not_assigned',
    stage,
    progress: stageProgressMap[stage],
    invoiceNumber: null,
    invoiceGeneratedAt: null,
    loadingCompletedAt: record.loadingCompletedAt,
    dispatchReadyAt: null,
    dispatchStartedAt: record.actualDispatchDate,
    deliveredAt: null,
    qualityApproved: true,
    eWayBillReady: Boolean(record.ewayBillNumber),
    dispatchApproved: stage === 'dispatched' || stage === 'in_transit',
    loadingProofAvailable: Boolean(record.loadingCompletedAt),
    delayed: false,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
};

export const fetchSellerDispatchesSnapshot = async (): Promise<DispatchSnapshot> => {
  const pages: SellerDispatchRecord[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await fetchSellerDispatchesPage({ page, limit: 50 });
    pages.push(...result.items);
    totalPages = result.pagination.totalPages;
    page += 1;
  } while (page <= totalPages && page <= 10);

  const orders = pages.map(mapSellerDispatchRecordToOrder);
  return buildSnapshotFromOrders(orders, orders[0]?.id ?? null);
};

const buildSnapshotFromOrders = (
  orders: DispatchOrder[],
  selectedDispatchId: string | null,
): DispatchSnapshot => {
  const normalizedOrders = sortOrders(orders.map(normalizeDispatchOrder));
  const assignedVehicle = Object.fromEntries(
    normalizedOrders.map((order) => [
      order.id,
      dispatchSeed.vehicles.find((vehicle) => vehicle.id === order.vehicleId) ?? null,
    ]),
  );
  const documents = Object.fromEntries(
    normalizedOrders.map((order) => [order.id, buildDocumentsForOrder(order)]),
  );
  const dispatchChecklist = Object.fromEntries(
    normalizedOrders.map((order) => [order.id, buildChecklistForOrder(order)]),
  );
  const dispatchHistory = Object.fromEntries(
    normalizedOrders.map((order) => [order.id, buildHistoryForOrder(order)]),
  );

  return {
    dispatchOrders: normalizedOrders,
    selectedDispatchId:
      selectedDispatchId && normalizedOrders.some((order) => order.id === selectedDispatchId)
        ? selectedDispatchId
        : normalizedOrders[0]?.id ?? null,
    summary: buildDispatchSummary(normalizedOrders),
    assignedVehicle,
    documents,
    dispatchChecklist,
    dispatchHistory,
    vehicles: dispatchSeed.vehicles,
    drivers: dispatchSeed.drivers,
  };
};

export const buildDefaultDispatchSnapshot = (): DispatchSnapshot =>
  buildSnapshotFromOrders(dispatchSeed.orders, dispatchSeed.orders[0]?.id ?? null);

export const getDispatchOrders = (): DispatchSnapshot => {
  const fallback = buildDefaultDispatchSnapshot();
  const persisted = safeParse<DispatchSnapshot>(
    getStorageItem(STORAGE_KEYS.SELLER_DISPATCH_STATE),
    fallback,
  );

  return buildSnapshotFromOrders(
    persisted.dispatchOrders?.length ? persisted.dispatchOrders : fallback.dispatchOrders,
    persisted.selectedDispatchId ?? fallback.selectedDispatchId,
  );
};

export const persistDispatchSnapshot = (snapshot: DispatchSnapshot): void => {
  setStorageItem(STORAGE_KEYS.SELLER_DISPATCH_STATE, JSON.stringify(snapshot));
};

const appendHistoryEntry = (
  history: DispatchHistoryEntry[],
  orderId: string,
  title: string,
  subtitle: string,
): DispatchHistoryEntry[] => [
  {
    id: `${orderId}-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    orderId,
    title,
    subtitle,
    timestamp: nowIso(),
  },
  ...history,
];

const updateOrder = (
  snapshot: DispatchSnapshot,
  orderId: string,
  updater: (order: DispatchOrder) => DispatchOrder,
): DispatchSnapshot => {
  const orders = snapshot.dispatchOrders.map((order) =>
    order.id === orderId ? normalizeDispatchOrder(updater(order)) : order,
  );
  return buildSnapshotFromOrders(orders, orderId);
};

export const assignVehicle = (
  snapshot: DispatchSnapshot,
  orderId: string,
  vehicleId: string,
  driverId: string,
): { snapshot: DispatchSnapshot; order: DispatchOrder | null } => {
  const vehicle = snapshot.vehicles.find((item) => item.id === vehicleId);
  const driver = snapshot.drivers.find((item) => item.id === driverId);
  if (!vehicle || !driver) {
    return { snapshot, order: null };
  }

  const nextSnapshot = updateOrder(snapshot, orderId, (order) => ({
    ...order,
    vehicleId,
    driverId,
    vehicleNumber: vehicle.vehicleNumber,
    vehicleType: vehicle.vehicleType,
    vehicleCapacity: vehicle.capacity,
    driverName: driver.name,
    driverPhone: driver.phone,
    vehicleStatus: 'assigned',
    stage: order.invoiceNumber ? 'loading' : 'vehicle_assigned',
    updatedAt: nowIso(),
  }));

  const order = nextSnapshot.dispatchOrders.find((item) => item.id === orderId) ?? null;
  if (order) {
    nextSnapshot.dispatchHistory[orderId] = appendHistoryEntry(
      nextSnapshot.dispatchHistory[orderId] ?? [],
      orderId,
      'Vehicle Assigned',
      `${vehicle.vehicleNumber} allocated to ${driver.name}.`,
    );
  }
  return { snapshot: buildSnapshotFromOrders(nextSnapshot.dispatchOrders, orderId), order };
};

export const generateInvoice = (
  snapshot: DispatchSnapshot,
  orderId: string,
): { snapshot: DispatchSnapshot; order: DispatchOrder | null } => {
  const timestamp = nowIso();
  const nextSnapshot = updateOrder(snapshot, orderId, (order) => ({
    ...order,
    invoiceNumber: order.invoiceNumber ?? `INV-${order.id.replace('PT-ORD-', '')}-${new Date().getFullYear()}`,
    invoiceGeneratedAt: order.invoiceGeneratedAt ?? timestamp,
    stage: order.vehicleNumber ? 'loading' : 'invoice_generated',
    updatedAt: timestamp,
  }));
  const order = nextSnapshot.dispatchOrders.find((item) => item.id === orderId) ?? null;
  if (order) {
    nextSnapshot.dispatchHistory[orderId] = appendHistoryEntry(
      nextSnapshot.dispatchHistory[orderId] ?? [],
      orderId,
      'Invoice Generated',
      `${order.invoiceNumber ?? 'Dispatch invoice'} prepared successfully.`,
    );
  }
  return { snapshot: buildSnapshotFromOrders(nextSnapshot.dispatchOrders, orderId), order };
};

export const completeLoading = (
  snapshot: DispatchSnapshot,
  orderId: string,
): { snapshot: DispatchSnapshot; order: DispatchOrder | null } => {
  const timestamp = nowIso();
  const nextSnapshot = updateOrder(snapshot, orderId, (order) => ({
    ...order,
    loadingCompletedAt: timestamp,
    dispatchReadyAt: timestamp,
    eWayBillReady: true,
    dispatchApproved: true,
    loadingProofAvailable: true,
    stage: 'dispatch_ready',
    updatedAt: timestamp,
  }));
  const order = nextSnapshot.dispatchOrders.find((item) => item.id === orderId) ?? null;
  if (order) {
    nextSnapshot.dispatchHistory[orderId] = appendHistoryEntry(
      nextSnapshot.dispatchHistory[orderId] ?? [],
      orderId,
      'Loading Completed',
      'Loading slip, E-Way Bill and dispatch note are now ready.',
    );
  }
  return { snapshot: buildSnapshotFromOrders(nextSnapshot.dispatchOrders, orderId), order };
};

export const markDispatched = (
  snapshot: DispatchSnapshot,
  orderId: string,
): { snapshot: DispatchSnapshot; order: DispatchOrder | null } => {
  const timestamp = nowIso();
  const nextSnapshot = updateOrder(snapshot, orderId, (order) => ({
    ...order,
    stage: 'in_transit',
    dispatchStartedAt: order.dispatchStartedAt ?? timestamp,
    eta: order.stage === 'delivered' ? 'Delivered' : 'In Transit',
    updatedAt: timestamp,
  }));
  const order = nextSnapshot.dispatchOrders.find((item) => item.id === orderId) ?? null;
  if (order) {
    nextSnapshot.dispatchHistory[orderId] = appendHistoryEntry(
      nextSnapshot.dispatchHistory[orderId] ?? [],
      orderId,
      'Shipment Dispatched',
      `${order.vehicleNumber ?? 'Assigned vehicle'} departed from ${order.loadingPoint}.`,
    );
  }
  return { snapshot: buildSnapshotFromOrders(nextSnapshot.dispatchOrders, orderId), order };
};

export const markDelivered = (
  snapshot: DispatchSnapshot,
  orderId: string,
): { snapshot: DispatchSnapshot; order: DispatchOrder | null } => {
  const timestamp = nowIso();
  const nextSnapshot = updateOrder(snapshot, orderId, (order) => ({
    ...order,
    stage: 'delivered',
    deliveredAt: timestamp,
    eta: 'Delivered',
    delayed: false,
    updatedAt: timestamp,
  }));
  const order = nextSnapshot.dispatchOrders.find((item) => item.id === orderId) ?? null;
  if (order) {
    nextSnapshot.dispatchHistory[orderId] = appendHistoryEntry(
      nextSnapshot.dispatchHistory[orderId] ?? [],
      orderId,
      'Shipment Delivered',
      'Delivery completed successfully at customer destination.',
    );
  }
  return { snapshot: buildSnapshotFromOrders(nextSnapshot.dispatchOrders, orderId), order };
};

export const getDocuments = (snapshot: DispatchSnapshot, orderId: string): DispatchDocument[] =>
  snapshot.documents[orderId] ?? [];

export const downloadDocument = (
  snapshot: DispatchSnapshot,
  orderId: string,
  documentId: string,
): DispatchDocument | null =>
  snapshot.documents[orderId]?.find((item) => item.id === documentId) ?? null;

export const mapDispatchOrderToOrder = (dispatchOrder: DispatchOrder): Order =>
  syncOrderDerivedFields({
    id: dispatchOrder.id,
    productName: dispatchOrder.material,
    grade: dispatchOrder.material,
    productCategory: dispatchOrder.material.includes('PVC')
      ? 'PVC'
      : dispatchOrder.material.includes('LLDPE')
        ? 'LLDPE'
        : dispatchOrder.material.includes('HDPE')
          ? 'HDPE'
          : 'PP',
    quantityMt: dispatchOrder.quantityMt,
    warehouse: dispatchOrder.loadingPoint,
    destination: dispatchOrder.destination,
    eta:
      dispatchOrder.stage === 'delivered'
        ? 'Delivered'
        : dispatchOrder.stage === 'in_transit' || dispatchOrder.stage === 'delayed'
          ? '3 Days'
          : null,
    progress: dispatchOrder.progress,
    shipmentStatus:
      dispatchOrder.stage === 'delivered'
        ? 'delivered'
        : dispatchOrder.stage === 'in_transit' || dispatchOrder.stage === 'delayed'
          ? 'in_transit'
          : 'processing',
    insuranceCovered: true,
    isMasterShipment: false,
    documents: [],
    amount: dispatchOrder.amount,
    paymentMethod: 'RTGS',
    paymentMethodId: 'advance',
    paymentStatus: dispatchOrder.paymentStatus,
    verificationStatus: dispatchOrder.paymentStatus === 'verified' ? 'verified' : 'pending',
    procurement: null,
    paymentVerifiedAt: dispatchOrder.paymentStatus === 'verified' ? dispatchOrder.createdAt : null,
    orderStatus:
      dispatchOrder.stage === 'in_transit' ||
      dispatchOrder.stage === 'dispatched' ||
      dispatchOrder.stage === 'delayed'
        ? 'dispatch_started'
        : 'purchase_order_generated',
    priceLockStatus: 'active',
    priceLockStartedAt: dispatchOrder.createdAt,
    priceLockDurationSeconds: 3600,
    validationTimeline: null,
    confirmationStatus: 'confirmed',
    supplierConfirmation: 'confirmed',
    inventoryReserved: true,
    poNumber: `PT-PO-${dispatchOrder.id.replace('PT-ORD-', '')}`,
    poGenerated: true,
    procurementCompleted: true,
    dispatchStatus:
      dispatchOrder.stage === 'delivered'
        ? 'delivered'
        : dispatchOrder.stage === 'in_transit' || dispatchOrder.stage === 'dispatched' || dispatchOrder.stage === 'delayed'
          ? 'shipment_started'
          : dispatchOrder.vehicleNumber
            ? 'vehicle_allocation'
            : 'planning',
    documentsReady: Boolean(dispatchOrder.invoiceNumber),
    workflowTimeline: null,
    dispatchReadiness:
      dispatchOrder.stage === 'dispatch_ready'
        ? 'Dispatch Ready'
        : dispatchOrder.stage === 'loading'
          ? 'Loading in Progress'
          : dispatchOrder.stage === 'ready_to_dispatch'
            ? 'Ready to Dispatch'
            : dispatchOrder.stage === 'delivered'
              ? 'Delivered'
              : dispatchOrder.stage === 'delayed'
                ? 'Delayed'
                : 'Shipment Moving',
    transitWindow: dispatchOrder.eta,
    trackingTimeline: null,
    dispatchTrackingTimeline: null,
    trackingAvailable:
      dispatchOrder.stage === 'in_transit' ||
      dispatchOrder.stage === 'dispatched' ||
      dispatchOrder.stage === 'delayed' ||
      dispatchOrder.stage === 'delivered',
    dispatchProgress: dispatchOrder.progress,
    dispatchStartedAt: dispatchOrder.dispatchStartedAt,
    shipmentDetails: dispatchOrder.vehicleNumber
      ? {
          vehicleNumber: dispatchOrder.vehicleNumber,
          driverName: dispatchOrder.driverName ?? 'Assigned Driver',
          driverContactMasked: dispatchOrder.driverPhone ?? '+91 ******0000',
          dispatchTime: dispatchOrder.dispatchStartedAt
            ? new Date(dispatchOrder.dispatchStartedAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Pending',
          currentLocation:
            dispatchOrder.stage === 'delivered'
              ? dispatchOrder.destination
              : dispatchOrder.stage === 'in_transit' || dispatchOrder.stage === 'delayed'
                ? 'On route to destination'
                : dispatchOrder.loadingPoint,
          transportPartner: 'PetroTrade Fleet',
        }
      : null,
    loadingStatus: dispatchOrder.loadingCompletedAt ? 'completed' : 'scheduled',
    loadingSchedule: null,
    loadingProof: dispatchOrder.loadingProofAvailable
      ? {
          status: 'verified',
          items: [
            { id: 'loading_photo', label: 'Loading Photo' },
            { id: 'weight_slip', label: 'Weight Slip' },
            { id: 'truck_rear', label: 'Truck Rear' },
            { id: 'seal_photo', label: 'Seal Photo' },
          ],
          finalWeightMt: dispatchOrder.quantityMt,
          truckNumber: dispatchOrder.vehicleNumber ?? 'Pending',
          digitalSealId: `SL-${dispatchOrder.id.slice(-4)}`,
          warehouse: dispatchOrder.loadingPoint,
        }
      : null,
    deliveryStatus:
      dispatchOrder.stage === 'delivered'
        ? 'delivered'
        : dispatchOrder.stage === 'in_transit' || dispatchOrder.stage === 'delayed'
          ? 'in_transit'
          : 'pending',
    deliveryDetails: null,
    deliveryProof: null,
    deliveryReceiver: null,
    digitalPod: null,
    deliverySummary: null,
    deliveredAt: dispatchOrder.deliveredAt,
    createdAt: dispatchOrder.createdAt,
    status:
      dispatchOrder.stage === 'delivered'
        ? 'DELIVERED'
        : dispatchOrder.stage === 'in_transit' || dispatchOrder.stage === 'dispatched' || dispatchOrder.stage === 'delayed'
          ? 'IN_TRANSIT'
          : 'DISPATCH_STARTED',
    currentStep:
      dispatchOrder.stage === 'delivered'
        ? 'DELIVERED'
        : dispatchOrder.stage === 'in_transit' || dispatchOrder.stage === 'dispatched' || dispatchOrder.stage === 'delayed'
          ? 'IN_TRANSIT'
          : 'DISPATCH_STARTED',
  });

type SellerOrderDispatchInput = {
  orderId: string;
  material: string;
  quantity: number;
  destination: string;
  warehouse: string;
  value: number;
  paymentMethod: string;
  buyerName: string;
};

export const createDispatchOrderFromSellerAcceptance = (
  snapshot: DispatchSnapshot,
  input: SellerOrderDispatchInput,
): { snapshot: DispatchSnapshot; order: DispatchOrder } => {
  const dispatchId = `PT-${input.orderId}`;
  const existing = snapshot.dispatchOrders.find(
    (order) => order.id === dispatchId || order.id === input.orderId,
  );
  if (existing) {
    return { snapshot, order: existing };
  }

  const timestamp = nowIso();
  const gstAmount = Math.round(input.value * 0.18);
  const dispatchOrder: DispatchOrder = {
    id: dispatchId,
    buyerLabel: 'Anonymous Buyer',
    material: input.material,
    quantityMt: input.quantity,
    eta: 'Pending scheduling',
    orderDateTime: new Date(timestamp).toLocaleString('en-IN', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    amount: input.value,
    gstAmount,
    destination: input.destination,
    loadingPoint: input.warehouse,
    vehicleNumber: null,
    vehicleType: null,
    driverName: null,
    driverPhone: null,
    driverId: null,
    vehicleId: null,
    vehicleCapacity: null,
    paymentStatus: input.paymentMethod.includes('advance') ? 'verified' : 'pending',
    vehicleStatus: 'not_assigned',
    stage: 'ready_to_dispatch',
    progress: stageProgressMap.ready_to_dispatch,
    invoiceNumber: null,
    invoiceGeneratedAt: null,
    loadingCompletedAt: null,
    dispatchReadyAt: null,
    dispatchStartedAt: null,
    deliveredAt: null,
    qualityApproved: true,
    eWayBillReady: false,
    dispatchApproved: false,
    loadingProofAvailable: false,
    delayed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const orders = [dispatchOrder, ...snapshot.dispatchOrders];
  return {
    snapshot: buildSnapshotFromOrders(orders, dispatchId),
    order: dispatchOrder,
  };
};

export const mapDispatchStageToSellerOrderStatus = (
  stage: DispatchStage,
): 'accepted' | 'dispatch_pending' | 'delivered' => {
  if (stage === 'delivered') {
    return 'delivered';
  }
  if (
    stage === 'loading' ||
    stage === 'dispatch_ready' ||
    stage === 'dispatched' ||
    stage === 'in_transit' ||
    stage === 'delayed'
  ) {
    return 'dispatch_pending';
  }
  return 'accepted';
};

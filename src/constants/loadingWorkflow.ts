import type { Order } from '@/types/order';
import type {
  LoadingProgressStep,
  LoadingProofState,
  LoadingScheduleDetails,
  LoadingVerificationStep,
} from '@/types/loading';

export const LOADING_WORKFLOW_COPY = {
  scheduled: {
    headerTitle: 'Loading Scheduled',
    pageTitle: 'Truck Allocated & Loading Scheduled',
    logisticsHeading: 'LOGISTICS DETAILS',
    timelineHeading: 'Loading Progress',
    continueLabel: 'Continue',
  },
  completed: {
    headerTitle: 'Loading Completed',
    successTitle: 'Loading Verification Successful',
    successSubtitle: 'All operational checks passed at terminal gates.',
    proofHeading: 'Loading Proof',
    finalWeightHeading: 'FINAL WEIGHT',
    timelineHeading: 'Order Lifecycle',
    continueLabel: 'Continue to Payment',
  },
} as const;

export const LOADING_LOGISTICS_LABELS = {
  warehouse: 'Warehouse',
  loadingBay: 'Loading Bay',
  loadingSlot: 'Loading Slot',
  expectedTime: 'Expected Loading Time',
  loadingTeam: 'Loading Team',
  vehicleNumber: 'Vehicle Number',
  truckAllocated: 'Truck Allocated',
} as const;

const DEFAULT_VEHICLE_NUMBER = 'GJ-01-XX-9092';

export const createLoadingScheduleDetails = (order: Order): LoadingScheduleDetails => ({
  warehouseName: order.warehouse,
  loadingBayNumber: 'Bay 04',
  loadingSlot: '14:00 – 16:00, Today',
  expectedLoadingTime: '45 Minutes',
  loadingTeam: 'Team Alpha Assigned',
  vehicleNumber: DEFAULT_VEHICLE_NUMBER,
});

export const createLoadingProofState = (order: Order): LoadingProofState => ({
  status: 'pending',
  items: [
    { id: 'loading_photo', label: 'Loading Photo' },
    { id: 'weight_slip', label: 'Weight Slip' },
    { id: 'truck_rear', label: 'Truck Rear Photo' },
    { id: 'seal_photo', label: 'Digital Seal Photo' },
  ],
  finalWeightMt: order.quantityMt * 0.962,
  truckNumber: DEFAULT_VEHICLE_NUMBER,
  digitalSealId: `PT-SEAL-${order.id.replace(/^PT-ORD-/, '').slice(-4)}-X`,
  warehouse: order.warehouse,
});

export const createLoadingScheduledPatch = (order: Order): Partial<Order> => ({
  loadingStatus: 'scheduled',
  inventoryReserved: true,
  dispatchStatus: 'driver_assigned',
  loadingSchedule: order.loadingSchedule ?? createLoadingScheduleDetails(order),
  loadingProof: order.loadingProof ?? createLoadingProofState(order),
  dispatchReadiness: 'Loading Scheduled',
});

export const createLoadingCompletedPatch = (order: Order): Partial<Order> => {
  const proof = order.loadingProof ?? createLoadingProofState(order);

  return {
    loadingStatus: 'completed',
    dispatchStatus: 'shipment_ready',
    inventoryReserved: true,
    procurementCompleted: true,
    loadingSchedule: order.loadingSchedule ?? createLoadingScheduleDetails(order),
    loadingProof: {
      ...proof,
      status: 'verified',
    },
    dispatchReadiness: 'Ready for Dispatch',
    dispatchTrackingTimeline: {
      currentStep: 'loading_completed',
      completedSteps: ['order_submitted', 'procurement', 'loading_scheduled'],
    },
  };
};

export const buildLoadingScheduledTimeline = (): LoadingProgressStep[] => [
  {
    id: 'inventory_reserved',
    title: 'Inventory Reserved',
    subtitle: 'Validated at Central Depot',
    status: 'completed',
  },
  {
    id: 'truck_allocated',
    title: 'Truck Allocated',
    subtitle: `Vehicle ${DEFAULT_VEHICLE_NUMBER}`,
    status: 'completed',
  },
  {
    id: 'loading_scheduled',
    title: 'Loading Scheduled',
    subtitle: 'Pending arrival at Bay 04',
    status: 'current',
  },
  {
    id: 'loading_started',
    title: 'Loading Started',
    status: 'pending',
  },
  {
    id: 'loading_completed',
    title: 'Loading Completed',
    status: 'pending',
  },
];

export const buildLoadingVerificationTimeline = (
  order: Order,
): LoadingVerificationStep[] => {
  const isCompleted = order.loadingStatus === 'completed';

  return [
    { id: 'order_submitted', title: 'Order Submitted', status: 'completed' as const },
    { id: 'procurement', title: 'Procurement', status: 'completed' as const },
    {
      id: 'loading_scheduled',
      title: 'Loading Scheduled',
      status: isCompleted ? ('completed' as const) : ('completed' as const),
    },
    {
      id: 'loading_completed',
      title: 'Loading Completed',
      status: isCompleted ? ('current' as const) : ('pending' as const),
      statusLabel: isCompleted ? 'Loading Verified' : undefined,
    },
  ];
};

export const formatFinalWeight = (weightMt: number): string => `${weightMt.toFixed(2)} MT`;

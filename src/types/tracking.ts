export type TrackingStepId =
  | 'order_submitted'
  | 'payment_verified'
  | 'procurement_approved'
  | 'purchase_order_generated'
  | 'dispatch_scheduled'
  | 'vehicle_allocated'
  | 'shipment_picked_up'
  | 'in_transit'
  | 'reached_destination_hub'
  | 'out_for_delivery'
  | 'delivered';

export type DispatchTrackingStepId =
  | 'order_submitted'
  | 'procurement'
  | 'loading_scheduled'
  | 'loading_completed'
  | 'payment_verified'
  | 'dispatch_started'
  | 'in_transit'
  | 'delivered';

export type TrackingStepStatus = 'completed' | 'current' | 'pending';

export type TrackingTimelineState = {
  currentStep: TrackingStepId;
  completedSteps: TrackingStepId[];
};

export type DispatchTrackingTimelineState = {
  currentStep: DispatchTrackingStepId;
  completedSteps: DispatchTrackingStepId[];
};

export type DispatchTrackingTimelineItem = {
  id: DispatchTrackingStepId;
  title: string;
  status: TrackingStepStatus;
};

export type TrackingTimelineItem = {
  id: TrackingStepId;
  title: string;
  date: string;
  time: string;
  statusLabel: string;
  status: TrackingStepStatus;
};

export type TrackingOrderStatus =
  | 'preparing'
  | 'dispatched'
  | 'transit'
  | 'out_for_delivery'
  | 'delivered';

export type TrackingOrderStatusBadgeConfig = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

export type ShipmentFilterTab = 'in_transit' | 'delivered' | 'delayed';

export type ShipmentLiveStatus = 'LIVE' | 'STABLE' | 'DELAYED';

export type ShipmentTimelineStatus = 'completed' | 'current' | 'pending';

export type ShipmentTimelineStep = {
  id: string;
  label: string;
  timestamp?: string;
  status: ShipmentTimelineStatus;
};

export type ShipmentDocument = {
  id: string;
  title: string;
  fileName: string;
};

export type ActiveShipment = {
  id: string;
  orderId: string;
  buyer?: string;
  vehicle: string;
  driver: string;
  destination: string;
  warehouse: string;
  status: ShipmentLiveStatus;
  filterStatus: ShipmentFilterTab;
  eta: string;
  etaLabel: string;
  speed?: number;
  progress: number;
  dispatchDate: string;
  route: string;
  timeline: ShipmentTimelineStep[];
  documents: ShipmentDocument[];
  driverPhone: string;
};

export type ShipmentAnalytics = {
  totalActive: string;
  onSchedule: string;
  criticalEta: string;
  averageSpeed: string;
};

export type ShipmentDashboardPreview = {
  id: string;
  shipmentId: string;
  route: string;
  status: 'On Time' | 'In Transit' | 'Delayed';
  eta: string;
};

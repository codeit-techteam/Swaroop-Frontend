export type LoadingStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed';

export type LoadingProofStatus = 'pending' | 'verified';

export type LoadingProofItemId =
  | 'loading_photo'
  | 'weight_slip'
  | 'truck_rear'
  | 'seal_photo';

export type LoadingProofItem = {
  id: LoadingProofItemId;
  label: string;
};

export type LoadingProofState = {
  status: LoadingProofStatus;
  items: LoadingProofItem[];
  finalWeightMt: number;
  truckNumber: string;
  digitalSealId: string;
  warehouse: string;
};

export type LoadingScheduleDetails = {
  warehouseName: string;
  loadingBayNumber: string;
  loadingSlot: string;
  expectedLoadingTime: string;
  loadingTeam: string;
  vehicleNumber: string;
};

export type LoadingProgressStepId =
  | 'inventory_reserved'
  | 'truck_allocated'
  | 'loading_scheduled'
  | 'loading_started'
  | 'loading_completed';

export type LoadingProgressStepStatus = 'completed' | 'current' | 'pending';

export type LoadingProgressStep = {
  id: LoadingProgressStepId;
  title: string;
  subtitle?: string;
  status: LoadingProgressStepStatus;
};

export type LoadingVerificationStepId =
  | 'order_submitted'
  | 'procurement'
  | 'loading_scheduled'
  | 'loading_completed';

export type LoadingVerificationStep = {
  id: LoadingVerificationStepId;
  title: string;
  status: LoadingProgressStepStatus;
  statusLabel?: string;
};

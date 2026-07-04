export type DocumentId =
  | 'pan'
  | 'gst'
  | 'aadhaar'
  | 'cancelled_cheque'
  | 'msme'
  | 'incorporation'
  | 'authorization_letter';

export type DocumentStatus =
  | 'idle'
  | 'uploading'
  | 'uploaded'
  | 'verified'
  | 'rejected'
  | 'error';

export type DocumentFile = {
  name: string;
  uri: string;
  size: number;
  mimeType?: string | null;
};

export type DocumentItem = {
  id: DocumentId;
  title: string;
  description: string;
  status: DocumentStatus;
  progress: number;
  required: boolean;
  file?: DocumentFile;
  errorMessage?: string;
};

export type StepperStepStatus = 'completed' | 'current' | 'upcoming';

export type StepperStep = {
  id: string;
  label: string;
  status: StepperStepStatus;
};

export type TimelineStepStatus = 'in_progress' | 'pending' | 'completed';

export type TimelineStep = {
  id: string;
  title: string;
  description: string;
  status: TimelineStepStatus;
  meta?: string;
};

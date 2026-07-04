export type DocumentId = 'pan' | 'gst' | 'aadhaar';

export type DocumentStatus = 'idle' | 'uploading' | 'verified' | 'error';

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

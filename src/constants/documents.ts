import type { DocumentItem, StepperStep, TimelineStep } from '@/types/document';

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;

export const BUSINESS_ENTITY = {
  name: 'Global PetroChem Ltd.',
  type: 'Private Limited Company',
  verified: true,
} as const;

export const KYC_STEPPER_STEPS: StepperStep[] = [
  { id: 'basic-info', label: 'Basic Info', status: 'completed' },
  { id: 'documents', label: 'Documents', status: 'current' },
  { id: 'review', label: 'Review', status: 'upcoming' },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'pan',
    title: 'PAN Card',
    description: 'Permanent Account Number issued by Income Tax Department.',
    status: 'verified',
    progress: 100,
    file: {
      name: 'PAN_CERT_2024.pdf',
      uri: 'local://pan-cert-2024.pdf',
      size: 245_760,
      mimeType: 'application/pdf',
    },
  },
  {
    id: 'gst',
    title: 'GST Certificate',
    description: 'Goods and Services Tax registration certificate.',
    status: 'idle',
    progress: 0,
  },
  {
    id: 'aadhaar',
    title: 'Aadhaar Card',
    description: 'Unique identification document for authorized signatory.',
    status: 'idle',
    progress: 0,
  },
];

export const generateKycReferenceId = (): string => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PT-KYC-${suffix}`;
};

export const buildSubmissionTimeline = (): TimelineStep[] => [
  {
    id: 'verification',
    title: 'Document Verification',
    description: 'Compliance team is reviewing your files.',
    status: 'in_progress',
    meta: 'In Progress — Est. 24-48 hours',
  },
  {
    id: 'activation',
    title: 'Account Activation',
    description: 'Receive trading credentials via email.',
    status: 'pending',
  },
];

export const SUPPORT_PHONE = '1-800-555-PETRO';

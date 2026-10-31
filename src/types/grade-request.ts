export type GradeRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INFO_REQUIRED'
  | 'GRADE_IDENTIFIED'
  | 'QUOTATION_AVAILABLE'
  | 'CONVERTED_TO_PR'
  | 'REJECTED'
  | 'CLOSED';

export const GRADE_REQUEST_UNITS = ['MT', 'KG', 'LTR'] as const;
export type GradeRequestUnit = (typeof GRADE_REQUEST_UNITS)[number];

export const GRADE_REQUEST_DOCUMENT_TYPES = [
  { value: 'TDS', label: 'TDS' },
  { value: 'TECHNICAL_SPECIFICATION', label: 'Specification' },
  { value: 'MSDS', label: 'MSDS' },
  { value: 'COA', label: 'COA' },
  { value: 'OTHER', label: 'Other' },
] as const;
export type GradeRequestDocumentType = (typeof GRADE_REQUEST_DOCUMENT_TYPES)[number]['value'];

export type GradeRequestTimelineItem = {
  id: string;
  type: string;
  toStatus: GradeRequestStatus | null;
  toStatusLabel: string | null;
  actor: 'YOU' | 'POLYSTOREX' | string;
  message: string | null;
  createdAt: string;
};

export type GradeRequestAttachment = {
  id: string;
  fileName: string;
};

export type GradeRequest = {
  id: string;
  referenceNumber: string;
  status: GradeRequestStatus;
  statusLabel: string;
  statusDescription: string;
  isOpen: boolean;
  awaitingCustomerResponse: boolean;
  gradeName: string;
  materialCategory: string;
  manufacturer: string | null;
  gradeGroup: string | null;
  application: string | null;
  technicalSpecs: string | null;
  remarks: string | null;
  quantity: string;
  unit: string;
  deliveryLocation: string;
  deliveryPincode: string | null;
  requiredByDate: string | null;
  preferredPackaging: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  adminMessage: string | null;
  closureReason: string | null;
  resolvedGrade: { id: string; code: string; name: string } | null;
  submittedAt: string;
  updatedAt: string;
  timeline: GradeRequestTimelineItem[];
  documents: GradeRequestAttachment[];
};

export type GradeRequestPrefill = {
  companyName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  defaultAddress: {
    id: string;
    formatted: string;
    postalCode: string | null;
  } | null;
  limits: {
    maxDocuments: number;
    maxFileSizeBytes: number;
    allowedMimeTypes: string[];
    storageConfigured: boolean;
  };
};

export type CatalogueMatch = {
  id: string;
  code: string;
  name: string;
  gradeNo?: string | null;
  manufacturer?: string | null;
};

export type CreateGradeRequestInput = {
  gradeName: string;
  materialCategory: string;
  manufacturer?: string;
  gradeGroup?: string;
  application?: string;
  technicalSpecs?: string;
  remarks?: string;
  quantity: number;
  unit: GradeRequestUnit;
  deliveryLocation: string;
  deliveryPincode?: string;
  deliveryAddressId?: string;
  requiredByDate?: string;
  preferredPackaging?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  idempotencyKey?: string;
  acknowledgeExisting?: boolean;
};

export type GradeRequestPage = {
  items: GradeRequest[];
  page: number;
  totalPages: number;
  total: number;
};

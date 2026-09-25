/**
 * Customer credit facility types.
 *
 * Mirrors the `/customer/credit/*` contract on Swaroop-Backend so Web and
 * Mobile read the same source of truth. Status strings are kept open-ended:
 * the backend owns the enum and new values must degrade gracefully.
 */

export const CREDIT_DOCUMENT_TYPES = [
  'gst_registration',
  'gst_returns',
  'bank_statement',
  'itr_financials',
  'cancelled_cheque',
  'business_registration',
  'other',
] as const;

export type CreditDocumentType = (typeof CREDIT_DOCUMENT_TYPES)[number];

export const REQUIRED_CREDIT_DOCUMENT_TYPES: CreditDocumentType[] = [
  'gst_registration',
  'bank_statement',
  'itr_financials',
];

export const CREDIT_DOCUMENT_LABELS: Record<CreditDocumentType, string> = {
  gst_registration: 'GST Registration Certificate',
  gst_returns: 'GST Returns',
  bank_statement: 'Bank Statement',
  itr_financials: 'ITR / Financial Statements',
  cancelled_cheque: 'Cancelled Cheque',
  business_registration: 'Business Registration',
  other: 'Supporting Document',
};

export const CREDIT_DOCUMENT_DESCRIPTIONS: Record<CreditDocumentType, string> = {
  gst_registration: 'GST registration certificate of the buying entity.',
  gst_returns: 'GSTR-3B filings for the last six months.',
  bank_statement: 'Current account statement for the last six months.',
  itr_financials: 'Latest income tax return or audited financial statements.',
  cancelled_cheque: 'Cancelled cheque of the registered business account.',
  business_registration: 'Incorporation or shop establishment certificate.',
  other: 'Any additional document requested by the credit team.',
};

export const CREDIT_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const CREDIT_MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;

/** Statuses the customer can no longer influence. */
export const TERMINAL_CREDIT_STATUSES = [
  'APPROVED',
  'PARTIALLY_APPROVED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'NOT_APPLIED',
] as const;

export type CreditTenureDays = 15 | 30;

export type CreditApplicationDocument = {
  id: string;
  documentNumber: string | null;
  documentType: string;
  label: string;
  category: string;
  fileName: string;
  mimeType: string | null;
  fileSizeBytes: string | null;
  status: string;
  version: number;
  rejectionReason: string | null;
  storagePending: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreditDocumentRequirement = {
  documentType: string;
  label: string;
  category: string;
  required: boolean;
  uploaded: boolean;
  documentId: string | null;
  status: string | null;
};

export type CreditMissingDocument = {
  documentType: string;
  label: string;
};

export type CreditTimelineEvent = {
  id: string;
  eventType: string;
  description: string;
  actorRole: string | null;
  customerVisible: boolean;
  createdAt: string;
};

export type CreditAccount = {
  id: string;
  accountNumber: string | null;
  status: string;
  accountStatus: string;
  approvedLimit: string;
  availableLimit: string;
  pendingCredit: string;
  utilizedAmount: string;
  outstandingAmount: string;
  overdueAmount: string;
  utilizationPercentage: number;
  currency: string;
  creditTermDays: number | null;
  approvedAt: string | null;
  expiresAt: string | null;
};

export type CreditLimit = {
  status: string;
  approvedLimit: string;
  availableLimit: string;
  pendingCredit: string;
  utilizedAmount: string;
  outstandingAmount: string;
  currency: string;
};

export type CreditApplication = {
  id: string;
  applicationNumber: string;
  status: string;
  requestedLimit: string;
  requestedTenureDays: number | null;
  purpose: string | null;
  currency: string;
  approvedLimit: string | null;
  approvedTenureDays: number | null;
  insuranceStatus: string | null;
  arrangementStatus: string | null;
  customerMessage: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  effectiveAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  nextStep: string;
  canSubmit: boolean;
  requiredDocuments: CreditDocumentRequirement[];
  missingDocuments: CreditMissingDocument[];
  documents: CreditApplicationDocument[];
  timeline?: CreditTimelineEvent[];
  account: CreditAccount | null;
  storage: { configured: boolean; pending: boolean };
};

export type CreditSummary = {
  status: string;
  application: {
    id: string;
    applicationNumber: string;
    status: string;
    requestedLimit: string;
    requestedTenureDays: number | null;
    purpose: string | null;
    submittedAt: string | null;
  } | null;
  account: CreditAccount | null;
};

export type CreditApplicationStatusSnapshot = {
  id: string;
  applicationNumber: string;
  status: string;
  insuranceStatus: string | null;
  arrangementStatus: string | null;
  customerMessage: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  approvedLimit: string | null;
  approvedTenureDays: number | null;
  missingDocuments: CreditMissingDocument[];
  canSubmit: boolean;
  nextStep: string;
};

export type CreditEligibility = {
  eligible: boolean;
  approvedLimit: string | number;
  availableLimit: string | number;
  tenureOptions: number[];
  source: string;
};

export type CreditDraftInput = {
  requestedLimit: number;
  requestedTenureDays?: number;
  purpose?: string;
};

export type CreditDocumentPick = {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
};

const STATUS_LABELS: Record<string, string> = {
  NOT_APPLIED: 'Not Applied',
  DRAFT: 'Draft',
  PENDING: 'Submitted',
  DOCUMENTS_UNDER_REVIEW: 'Documents Under Review',
  UNDER_REVIEW: 'Under Review',
  DOCUMENTS_REQUIRED: 'Documents Required',
  INSURANCE_REVIEW: 'Insurance Review',
  CREDIT_ARRANGEMENT_PENDING: 'Arrangement Pending',
  APPROVED: 'Approved',
  PARTIALLY_APPROVED: 'Partially Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  BLOCKED: 'Blocked',
};

const STATUS_BADGE_VARIANTS: Record<string, 'success' | 'primary' | 'muted' | 'uploaded'> = {
  APPROVED: 'success',
  PARTIALLY_APPROVED: 'success',
  ACTIVE: 'success',
  DOCUMENTS_REQUIRED: 'uploaded',
  REJECTED: 'muted',
  EXPIRED: 'muted',
  CANCELLED: 'muted',
  NOT_APPLIED: 'muted',
  SUSPENDED: 'muted',
  BLOCKED: 'muted',
};

/** Human label for any backend status, including values this build predates. */
export function creditStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const known = STATUS_LABELS[status];
  if (known) return known;
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function creditStatusVariant(
  status: string | null | undefined,
): 'success' | 'primary' | 'muted' | 'uploaded' {
  if (!status) return 'muted';
  return STATUS_BADGE_VARIANTS[status] ?? 'primary';
}

export function isTerminalCreditStatus(status: string | null | undefined): boolean {
  if (!status) return true;
  return (TERMINAL_CREDIT_STATUSES as readonly string[]).includes(status);
}

/** True when the customer may still create a fresh application. */
export function canStartNewCreditApplication(status: string | null | undefined): boolean {
  if (!status) return true;
  return ['NOT_APPLIED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(status);
}

export function creditDocumentLabel(documentType: string): string {
  return (
    CREDIT_DOCUMENT_LABELS[documentType as CreditDocumentType] ??
    CREDIT_DOCUMENT_LABELS.other
  );
}

export function creditDocumentDescription(documentType: string): string {
  return (
    CREDIT_DOCUMENT_DESCRIPTIONS[documentType as CreditDocumentType] ??
    CREDIT_DOCUMENT_DESCRIPTIONS.other
  );
}

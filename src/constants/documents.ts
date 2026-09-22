import type {
  DocumentStatus,
  DocumentTab,
  DocumentsFiltersState,
  InvoiceDocStatus,
  PaymentDocStatus,
  ProformaStatus,
} from '@/types/documents';

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  generated: 'Generated',
  downloaded: 'Downloaded',
  pending: 'Pending',
  approved: 'Approved',
  verified: 'Verified',
  cancelled: 'Cancelled',
};

export const PAYMENT_DOC_STATUS_LABELS: Record<PaymentDocStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  refunded: 'Refunded',
};

export const INVOICE_DOC_STATUS_LABELS: Record<InvoiceDocStatus, string> = {
  draft: 'Draft',
  generated: 'Generated',
  sent: 'Sent',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export const PROFORMA_STATUS_LABELS: Record<ProformaStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  converted: 'Converted',
  cancelled: 'Cancelled',
};

export const DOCUMENT_TABS: {
  id: DocumentTab;
  title: string;
  description: string;
}[] = [
  {
    id: 'purchase_orders',
    title: 'Purchase Orders',
    description: 'Formal POs linked to approved purchase requests and PetroTrade confirmations.',
  },
  {
    id: 'invoices',
    title: 'Tax Invoices',
    description: 'Tax invoices generated after commercial confirmation and payment milestones.',
  },
  {
    id: 'proforma',
    title: 'Proforma Invoice',
    description: 'Commercial proforma invoices pending conversion to tax invoices.',
  },
];

export const DOCUMENT_PROFILE_ITEMS = [
  {
    id: 'purchase_orders' as const,
    title: 'Purchase Orders',
    subtitle: 'Formal POs linked to confirmed orders',
  },
  {
    id: 'invoices' as const,
    title: 'Tax Invoices',
    subtitle: 'Tax invoices after commercial confirmation',
  },
  {
    id: 'proforma' as const,
    title: 'Proforma Invoice',
    subtitle: 'Proformas pending conversion',
  },
] as const;

export const DEFAULT_DOCUMENTS_FILTERS: DocumentsFiltersState = {
  search: '',
  status: 'all',
  warehouse: 'all',
  seller: 'all',
  sortBy: 'newest',
};

export const DOCUMENT_STATUS_FILTERS: (DocumentStatus | 'all')[] = [
  'all',
  'generated',
  'downloaded',
  'pending',
  'approved',
  'verified',
  'cancelled',
];

export const BLIND_SUPPLY_SOURCE = 'ANONYMOUS SUPPLIER';
export const BLIND_WAREHOUSE = 'Assigned hub';

export const PLATFORM_PARTY = {
  name: 'PetroTrade Technologies Pvt Ltd',
  gstin: '27AABCP4821Q1ZV',
  address: '12th Floor, One BKC, Bandra Kurla Complex',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
} as const;

export {
  ALLOWED_DOCUMENT_TYPES,
  COMPANY_TYPE_OPTIONS,
  EMPTY_BUSINESS_INFO,
  INDIAN_STATES,
  INITIAL_DOCUMENTS,
  MANDATORY_DOCUMENT_IDS,
  MAX_DOCUMENT_SIZE_BYTES,
  NATURE_OF_BUSINESS_OPTIONS,
  STATE_OPTIONS,
  SUPPORT_PHONE,
  buildSubmissionTimeline,
  generateKycReferenceId,
  getKycStepperSteps,
} from '@/constants/kyc';

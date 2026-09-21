export type DocumentStatus =
  'generated' | 'downloaded' | 'pending' | 'approved' | 'verified' | 'cancelled';

export type DocumentTab = 'purchase_orders' | 'invoices' | 'proforma' | 'gst_invoices';

export type DocumentKind = 'purchase_order' | 'invoice' | 'proforma' | 'gst_invoice';

export type PaymentDocStatus = 'unpaid' | 'partial' | 'paid' | 'overdue' | 'refunded';

export type InvoiceDocStatus = 'draft' | 'generated' | 'sent' | 'paid' | 'cancelled';

export type ProformaStatus = 'active' | 'expired' | 'converted' | 'cancelled';

export type DocumentSortBy = 'newest' | 'oldest';

export interface PartyInfo {
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DocumentPricing {
  unitPrice: number;
  quantityMt: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  freight: number;
  insurance: number;
  grandTotal: number;
}

export interface DocumentTimelineEvent {
  id: string;
  label: string;
  description?: string;
  at: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface PurchaseOrderDocument {
  id: string;
  poNumber: string;
  orderNumber: string;
  product: string;
  grade: string;
  seller: string;
  warehouse: string;
  quantityMt: number;
  poDate: string;
  amount: number;
  status: DocumentStatus;
  buyer: PartyInfo;
  sellerInfo: PartyInfo;
  pricing: DocumentPricing;
  paymentTerms: string;
  deliveryTerms: string;
  timeline: DocumentTimelineEvent[];
  downloadedAt?: string | null;
}

export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  poNumber: string;
  invoiceDate: string;
  amount: number;
  gst: number;
  totalAmount: number;
  paymentStatus: PaymentDocStatus;
  invoiceStatus: InvoiceDocStatus;
  status: DocumentStatus;
  product: string;
  grade: string;
  seller: string;
  warehouse: string;
  company: PartyInfo;
  buyer: PartyInfo;
  sellerInfo: PartyInfo;
  pricing: DocumentPricing;
  paymentInfo: {
    method: string;
    dueDate: string;
    paidDate?: string | null;
    utr?: string | null;
  };
  timeline: DocumentTimelineEvent[];
  downloadedAt?: string | null;
}

export interface ProformaInvoiceDocument {
  id: string;
  proformaNumber: string;
  product: string;
  grade: string;
  orderNumber: string;
  poNumber?: string | null;
  amount: number;
  createdDate: string;
  expiryDate: string;
  status: ProformaStatus;
  docStatus: DocumentStatus;
  seller: string;
  warehouse: string;
  buyer: PartyInfo;
  sellerInfo: PartyInfo;
  pricing: DocumentPricing;
  paymentTerms: string;
  validityNote: string;
  convertedInvoiceId?: string | null;
}

export interface GstInvoiceDocument {
  id: string;
  gstNumber: string;
  invoiceNumber: string;
  orderNumber: string;
  poNumber: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grandTotal: number;
  invoiceDate: string;
  seller: string;
  warehouse: string;
  product: string;
  status: DocumentStatus;
  placeOfSupply: string;
  hsn: string;
  buyerGstin: string;
  sellerGstin: string;
}

export interface DocumentsFiltersState {
  search: string;
  status: DocumentStatus | 'all';
  warehouse: string;
  seller: string;
  sortBy: DocumentSortBy;
}

export interface DocumentPreviewState {
  title: string;
  subtitle?: string;
  fileName: string;
  categoryLabel: string;
  documentNumber?: string;
  orderNumber?: string;
  content: string;
}

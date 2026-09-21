import { apiClient } from '@/api/client';
import { BLIND_SUPPLY_SOURCE, BLIND_WAREHOUSE, PLATFORM_PARTY } from '@/constants/documents';
import { ensureDevBackendSession } from '@/services/backend-session';
import type { BackendCustomerOrder } from '@/services/orders';
import type {
  DocumentPricing,
  GstInvoiceDocument,
  InvoiceDocument,
  PartyInfo,
  ProformaInvoiceDocument,
  PurchaseOrderDocument,
} from '@/types/documents';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { totalPages?: number; total?: number };
};

export type BackendProforma = {
  id: string;
  piNumber?: string;
  status?: string;
  issueDate?: string | null;
  dueDate?: string | null;
  createdAt?: string;
  subtotal?: unknown;
  taxAmount?: unknown;
  totalAmount?: unknown;
  paidAmount?: unknown;
  remainingAmount?: unknown;
  purchaseOrderId?: string | null;
  paymentMode?: string | null;
  paymentMethod?: string | null;
  billing?: { legalName?: string | null } | null;
  lines?: {
    description?: string;
    quantity?: unknown;
    unitPrice?: unknown;
    taxAmount?: unknown;
    lineTotal?: unknown;
  }[];
};

const BLANK_PARTY: PartyInfo = {
  name: '—',
  gstin: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function iso(value?: string | null) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function pricingFrom(amount: number, taxAmount = 0, quantityMt = 0): DocumentPricing {
  const taxable = Math.max(0, amount - taxAmount);
  const halfGst = taxAmount / 2;
  return {
    unitPrice: quantityMt > 0 ? taxable / quantityMt : taxable,
    quantityMt,
    taxableValue: taxable,
    gstRate: taxable > 0 ? Math.round((taxAmount / taxable) * 100) : 0,
    cgst: halfGst,
    sgst: halfGst,
    igst: 0,
    freight: 0,
    insurance: 0,
    grandTotal: amount,
  };
}

function sellerParty(): PartyInfo {
  return { ...PLATFORM_PARTY };
}

async function paginateAll<T>(path: string): Promise<T[]> {
  await ensureDevBackendSession('customer');
  const pages: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const payload = await apiClient.get<Envelope<T[]>>(`${path}?page=${page}&limit=50`);
    pages.push(...(payload.data.data ?? []));
    totalPages = payload.data.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  return pages;
}

export function mapOrderToPurchaseOrder(item: BackendCustomerOrder): PurchaseOrderDocument {
  const primary = item.items?.[0];
  const amount = num(item.amounts?.totalAmount ?? primary?.totalAmount);
  const taxAmount = num(item.amounts?.taxAmount);
  const quantityMt = num(item.quantity ?? primary?.quantity);
  const createdAt = iso(item.createdAt);
  const cancelled =
    (item.status ?? '').toUpperCase().includes('CANCEL') || item.presentationBucket === 'CANCELLED';

  return {
    id: item.id,
    poNumber: item.orderNumber || item.purchaseOrderId || item.id,
    orderNumber: item.orderNumber || item.id,
    product: item.productName ?? primary?.productName ?? 'Purchase order',
    grade: item.gradeName ?? primary?.gradeName ?? '—',
    seller: BLIND_SUPPLY_SOURCE,
    warehouse: BLIND_WAREHOUSE,
    quantityMt,
    poDate: createdAt,
    amount,
    status: cancelled ? 'cancelled' : 'generated',
    buyer: { ...BLANK_PARTY, name: 'Your company' },
    sellerInfo: sellerParty(),
    pricing: pricingFrom(amount, taxAmount, quantityMt),
    paymentTerms: item.payment?.paymentOptionLabel ?? item.payment?.paymentOption ?? 'ADVANCE',
    deliveryTerms: 'As agreed',
    timeline: [{ id: 'created', label: 'PO Generated', at: createdAt, status: 'completed' }],
    downloadedAt: null,
  };
}

export function mapProformaToDocument(
  item: BackendProforma,
  relatedPo?: PurchaseOrderDocument,
): ProformaInvoiceDocument {
  const amount = num(item.totalAmount);
  const taxAmount = num(item.taxAmount);
  const created = iso(item.issueDate ?? item.createdAt);
  const expiry = iso(item.dueDate ?? item.createdAt);
  const statusKey = (item.status ?? '').toUpperCase();
  const line = item.lines?.[0];
  const cancelled = statusKey.includes('CANCEL');
  const converted = statusKey === 'PAID';

  return {
    id: item.id,
    proformaNumber: item.piNumber ?? item.id,
    product: relatedPo?.product ?? line?.description ?? 'Proforma invoice',
    grade: relatedPo?.grade ?? '—',
    orderNumber: relatedPo?.orderNumber ?? item.purchaseOrderId ?? item.id,
    poNumber: relatedPo?.poNumber ?? item.purchaseOrderId ?? item.id,
    amount,
    createdDate: created,
    expiryDate: expiry,
    status: cancelled ? 'cancelled' : converted ? 'converted' : 'active',
    docStatus: cancelled ? 'cancelled' : 'generated',
    seller: BLIND_SUPPLY_SOURCE,
    warehouse: BLIND_WAREHOUSE,
    buyer: {
      ...BLANK_PARTY,
      name: item.billing?.legalName ?? 'Your company',
    },
    sellerInfo: sellerParty(),
    pricing: pricingFrom(amount, taxAmount, relatedPo?.quantityMt ?? num(line?.quantity)),
    paymentTerms: item.paymentMode ?? item.paymentMethod ?? 'ADVANCE',
    validityNote: 'Valid until converted or cancelled',
  };
}

export function mapProformaToInvoice(
  item: BackendProforma,
  relatedPo?: PurchaseOrderDocument,
): InvoiceDocument {
  const amount = num(item.totalAmount);
  const taxAmount = num(item.taxAmount);
  const paid = (item.status ?? '').toUpperCase() === 'PAID';
  const remaining = num(item.remainingAmount);
  const invoiceDate = iso(item.issueDate ?? item.createdAt);
  const line = item.lines?.[0];
  const quantityMt = relatedPo?.quantityMt ?? num(line?.quantity);

  let paymentStatus: InvoiceDocument['paymentStatus'] = 'unpaid';
  if (paid) paymentStatus = 'paid';
  else if (remaining > 0 && remaining < amount) paymentStatus = 'partial';

  return {
    id: item.id,
    invoiceNumber: item.piNumber ?? item.id,
    orderNumber: relatedPo?.orderNumber ?? item.purchaseOrderId ?? item.id,
    poNumber: relatedPo?.poNumber ?? item.purchaseOrderId ?? item.id,
    invoiceDate,
    amount: num(item.subtotal) || Math.max(0, amount - taxAmount),
    gst: taxAmount,
    totalAmount: amount,
    paymentStatus,
    invoiceStatus: paid ? 'paid' : 'generated',
    status: 'generated',
    product: relatedPo?.product ?? line?.description ?? 'Invoice',
    grade: relatedPo?.grade ?? '—',
    seller: BLIND_SUPPLY_SOURCE,
    warehouse: BLIND_WAREHOUSE,
    company: sellerParty(),
    buyer: {
      ...BLANK_PARTY,
      name: item.billing?.legalName ?? 'Your company',
    },
    sellerInfo: sellerParty(),
    pricing: pricingFrom(amount, taxAmount, quantityMt),
    paymentInfo: {
      method: item.paymentMode ?? item.paymentMethod ?? 'ADVANCE',
      dueDate: iso(item.dueDate ?? item.createdAt),
    },
    timeline: [{ id: 'created', label: 'Issued', at: invoiceDate, status: 'completed' }],
    downloadedAt: null,
  };
}

export function mapInvoiceToGst(inv: InvoiceDocument): GstInvoiceDocument {
  return {
    id: `gst-${inv.id}`,
    gstNumber: inv.buyer.gstin || inv.company.gstin || PLATFORM_PARTY.gstin,
    invoiceNumber: inv.invoiceNumber,
    orderNumber: inv.orderNumber,
    poNumber: inv.poNumber,
    taxableValue: inv.pricing.taxableValue,
    cgst: inv.pricing.cgst,
    sgst: inv.pricing.sgst,
    igst: inv.pricing.igst,
    totalGst: inv.gst || inv.pricing.cgst + inv.pricing.sgst + inv.pricing.igst,
    grandTotal: inv.totalAmount,
    invoiceDate: inv.invoiceDate,
    seller: inv.seller,
    warehouse: inv.warehouse,
    product: inv.product,
    status: inv.status,
    placeOfSupply: inv.buyer.state || 'India',
    hsn: '—',
    buyerGstin: inv.buyer.gstin || '—',
    sellerGstin: inv.sellerInfo.gstin || PLATFORM_PARTY.gstin,
  };
}

export async function fetchCustomerDocumentOrders(): Promise<BackendCustomerOrder[]> {
  return paginateAll<BackendCustomerOrder>('/customer/orders');
}

export async function fetchCustomerProformaInvoices(): Promise<BackendProforma[]> {
  return paginateAll<BackendProforma>('/customer/proforma-invoices');
}

export async function fetchCustomerDocumentsCatalog() {
  const [ordersResult, proformasResult] = await Promise.allSettled([
    fetchCustomerDocumentOrders(),
    fetchCustomerProformaInvoices(),
  ]);

  const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
  const proformas = proformasResult.status === 'fulfilled' ? proformasResult.value : [];

  if (ordersResult.status === 'rejected' && proformasResult.status === 'rejected') {
    throw ordersResult.reason instanceof Error
      ? ordersResult.reason
      : new Error('Unable to load documents.');
  }

  const purchaseOrders = orders.map(mapOrderToPurchaseOrder);
  const poById = new Map(purchaseOrders.map((po) => [po.id, po]));
  const poByNumber = new Map(purchaseOrders.map((po) => [po.poNumber, po]));

  const related = (item: BackendProforma) =>
    (item.purchaseOrderId ? poById.get(item.purchaseOrderId) : undefined) ??
    (item.purchaseOrderId ? poByNumber.get(item.purchaseOrderId) : undefined);

  const invoices = proformas.map((item) => mapProformaToInvoice(item, related(item)));
  const mappedProformas = proformas.map((item) => mapProformaToDocument(item, related(item)));
  const gstInvoices = invoices.map(mapInvoiceToGst);

  return {
    purchaseOrders,
    invoices,
    proformas: mappedProformas,
    gstInvoices,
  };
}

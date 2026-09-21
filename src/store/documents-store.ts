import { create } from 'zustand';

import { DEFAULT_DOCUMENTS_FILTERS, PLATFORM_PARTY } from '@/constants/documents';
import { fetchCustomerDocumentsCatalog } from '@/services/documents';
import type {
  DocumentKind,
  DocumentStatus,
  DocumentsFiltersState,
  GstInvoiceDocument,
  InvoiceDocument,
  ProformaInvoiceDocument,
  PurchaseOrderDocument,
} from '@/types/documents';

type DocumentsStoreState = {
  purchaseOrders: PurchaseOrderDocument[];
  invoices: InvoiceDocument[];
  proformas: ProformaInvoiceDocument[];
  gstInvoices: GstInvoiceDocument[];
  filters: DocumentsFiltersState;
  isHydrated: boolean;
  isLoading: boolean;
  loadError: string | null;
  fetchFromApi: () => Promise<void>;
  setFilters: (patch: Partial<DocumentsFiltersState>) => void;
  resetFilters: () => void;
  markDownloaded: (kind: DocumentKind, id: string) => void;
  convertProformaToInvoice: (proformaId: string) => string | null;
  duplicatePurchaseOrder: (poId: string) => string | null;
};

function nowIso() {
  return new Date().toISOString();
}

function matchesSearch(haystacks: (string | null | undefined)[], q: string) {
  return haystacks.filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
}

function sortByDate<T>(
  items: T[],
  getDate: (item: T) => string,
  sortBy: DocumentsFiltersState['sortBy'],
) {
  const dir = sortBy === 'oldest' ? 1 : -1;
  return [...items].sort(
    (a, b) => (new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime()) * dir,
  );
}

function applyCommonFilters<T extends { warehouse: string; seller: string }>(
  items: T[],
  filters: DocumentsFiltersState,
  match: (item: T, query: string) => boolean,
  getDate: (item: T) => string,
  getStatus?: (item: T) => DocumentStatus,
) {
  let list = [...items];
  const query = filters.search.trim().toLowerCase();
  if (query) list = list.filter((item) => match(item, query));
  if (filters.status !== 'all' && getStatus) {
    list = list.filter((item) => getStatus(item) === filters.status);
  }
  if (filters.warehouse !== 'all') {
    list = list.filter((item) => item.warehouse === filters.warehouse);
  }
  if (filters.seller !== 'all') {
    list = list.filter((item) => item.seller === filters.seller);
  }
  return sortByDate(list, getDate, filters.sortBy);
}

export function filterPurchaseOrders(
  items: PurchaseOrderDocument[],
  filters: DocumentsFiltersState,
) {
  return applyCommonFilters(
    items,
    filters,
    (item, query) =>
      matchesSearch(
        [item.poNumber, item.orderNumber, item.product, item.seller, item.warehouse, item.grade],
        query,
      ),
    (item) => item.poDate,
    (item) => item.status,
  );
}

export function filterInvoices(items: InvoiceDocument[], filters: DocumentsFiltersState) {
  return applyCommonFilters(
    items,
    filters,
    (item, query) =>
      matchesSearch(
        [
          item.invoiceNumber,
          item.orderNumber,
          item.poNumber,
          item.product,
          item.seller,
          item.warehouse,
        ],
        query,
      ),
    (item) => item.invoiceDate,
    (item) => item.status,
  );
}

export function filterProformas(items: ProformaInvoiceDocument[], filters: DocumentsFiltersState) {
  return applyCommonFilters(
    items,
    filters,
    (item, query) =>
      matchesSearch(
        [item.proformaNumber, item.orderNumber, item.product, item.seller, item.warehouse],
        query,
      ),
    (item) => item.createdDate,
    (item) => item.docStatus,
  );
}

export function filterGstInvoices(items: GstInvoiceDocument[], filters: DocumentsFiltersState) {
  return applyCommonFilters(
    items,
    filters,
    (item, query) =>
      matchesSearch(
        [
          item.invoiceNumber,
          item.gstNumber,
          item.orderNumber,
          item.poNumber,
          item.product,
          item.seller,
          item.warehouse,
        ],
        query,
      ),
    (item) => item.invoiceDate,
    (item) => item.status,
  );
}

export function getFacetOptions(state: {
  purchaseOrders: PurchaseOrderDocument[];
  invoices: InvoiceDocument[];
}) {
  const sellers = new Set<string>();
  const warehouses = new Set<string>();
  [...state.purchaseOrders, ...state.invoices].forEach((item) => {
    sellers.add(item.seller);
    warehouses.add(item.warehouse);
  });
  return {
    sellers: Array.from(sellers).sort(),
    warehouses: Array.from(warehouses).sort(),
  };
}

export const useDocumentsStore = create<DocumentsStoreState>((set, get) => ({
  purchaseOrders: [],
  invoices: [],
  proformas: [],
  gstInvoices: [],
  filters: { ...DEFAULT_DOCUMENTS_FILTERS },
  isHydrated: false,
  isLoading: false,
  loadError: null,

  fetchFromApi: async () => {
    set({ isLoading: true, loadError: null });
    try {
      const catalog = await fetchCustomerDocumentsCatalog();
      set({
        ...catalog,
        isLoading: false,
        isHydrated: true,
        loadError: null,
      });
    } catch (error) {
      set({
        purchaseOrders: [],
        invoices: [],
        proformas: [],
        gstInvoices: [],
        isLoading: false,
        isHydrated: true,
        loadError: error instanceof Error ? error.message : 'Unable to load documents.',
      });
    }
  },

  setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),

  resetFilters: () => set({ filters: { ...DEFAULT_DOCUMENTS_FILTERS } }),

  markDownloaded: (kind, id) => {
    const stamp = nowIso();
    set((state) => {
      if (kind === 'purchase_order') {
        return {
          purchaseOrders: state.purchaseOrders.map((item) =>
            item.id === id ? { ...item, status: 'downloaded', downloadedAt: stamp } : item,
          ),
        };
      }
      if (kind === 'invoice') {
        return {
          invoices: state.invoices.map((item) =>
            item.id === id ? { ...item, status: 'downloaded', downloadedAt: stamp } : item,
          ),
        };
      }
      if (kind === 'proforma') {
        return {
          proformas: state.proformas.map((item) =>
            item.id === id ? { ...item, docStatus: 'downloaded' } : item,
          ),
        };
      }
      return {
        gstInvoices: state.gstInvoices.map((item) =>
          item.id === id ? { ...item, status: 'downloaded' } : item,
        ),
      };
    });
  },

  convertProformaToInvoice: (proformaId) => {
    const proforma = get().proformas.find((item) => item.id === proformaId);
    if (!proforma || proforma.status === 'converted') return null;

    const invId = `inv-from-${proformaId}`;
    const invoiceNumber = `INV-2026-C${String(Date.now()).slice(-4)}`;
    const invoice: InvoiceDocument = {
      id: invId,
      invoiceNumber,
      orderNumber: proforma.orderNumber,
      poNumber: proforma.poNumber ?? '—',
      invoiceDate: nowIso(),
      amount: proforma.pricing.taxableValue,
      gst: proforma.pricing.cgst + proforma.pricing.sgst + proforma.pricing.igst,
      totalAmount: proforma.pricing.grandTotal,
      paymentStatus: 'unpaid',
      invoiceStatus: 'generated',
      status: 'generated',
      product: proforma.product,
      grade: proforma.grade,
      seller: proforma.seller,
      warehouse: proforma.warehouse,
      company: { ...PLATFORM_PARTY },
      buyer: proforma.buyer,
      sellerInfo: proforma.sellerInfo,
      pricing: proforma.pricing,
      paymentInfo: {
        method: proforma.paymentTerms,
        dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      },
      timeline: [
        {
          id: 'tl-convert',
          label: 'Invoice Generated',
          description: `Converted from ${proforma.proformaNumber}`,
          at: nowIso(),
          status: 'completed',
        },
      ],
      downloadedAt: null,
    };

    set((state) => ({
      invoices: [invoice, ...state.invoices],
      gstInvoices: [
        {
          id: `gst-${invId}`,
          gstNumber: invoice.buyer.gstin || PLATFORM_PARTY.gstin,
          invoiceNumber,
          orderNumber: invoice.orderNumber,
          poNumber: invoice.poNumber,
          taxableValue: invoice.pricing.taxableValue,
          cgst: invoice.pricing.cgst,
          sgst: invoice.pricing.sgst,
          igst: invoice.pricing.igst,
          totalGst: invoice.gst,
          grandTotal: invoice.totalAmount,
          invoiceDate: invoice.invoiceDate,
          seller: invoice.seller,
          warehouse: invoice.warehouse,
          product: invoice.product,
          status: 'generated',
          placeOfSupply: invoice.buyer.state || 'India',
          hsn: '—',
          buyerGstin: invoice.buyer.gstin || '—',
          sellerGstin: invoice.sellerInfo.gstin || PLATFORM_PARTY.gstin,
        },
        ...state.gstInvoices,
      ],
      proformas: state.proformas.map((item) =>
        item.id === proformaId
          ? {
              ...item,
              status: 'converted' as const,
              convertedInvoiceId: invId,
              docStatus: 'verified' as DocumentStatus,
            }
          : item,
      ),
    }));

    return invId;
  },

  duplicatePurchaseOrder: (poId) => {
    const source = get().purchaseOrders.find((item) => item.id === poId);
    if (!source) return null;
    const id = `po-dup-${Date.now()}`;
    const poNumber = `PO-2026-D${String(Date.now()).slice(-4)}`;
    set((state) => ({
      purchaseOrders: [
        {
          ...source,
          id,
          poNumber,
          poDate: nowIso(),
          status: 'generated',
          downloadedAt: null,
        },
        ...state.purchaseOrders,
      ],
    }));
    return id;
  },
}));

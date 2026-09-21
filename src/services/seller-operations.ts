import { apiClient } from '@/api/client';
import { isAxiosError } from 'axios';
import type { SellerOrder, SellerOrderPaymentMethod, SellerOrderStatus } from '@/seller/modules/seller-orders/types/sellerOrders';
import type {
  DocumentCategory,
  DocumentStatus,
  SellerDocumentItem,
} from '@/seller/types/documents';
import type { SellerNotification, SellerNotificationsSnapshot } from '@/seller/types/notifications';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { totalPages?: number };
};

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapPaymentMethod(value?: string | null): SellerOrderPaymentMethod {
  const key = (value ?? '').toUpperCase();
  if (key.includes('LOAD')) return 'on_loading';
  if (key.includes('DELIV')) return 'on_delivery';
  if (key.includes('30')) return 'credit_30_days';
  if (key.includes('CREDIT')) return 'credit_15_days';
  return 'advance_payment';
}

function mapSellerStatus(status: string): SellerOrderStatus {
  const key = status.toUpperCase();
  if (key.includes('REJECT') || key.includes('CANCEL')) return 'rejected';
  if (key.includes('DELIVER')) return 'delivered';
  if (key.includes('DISPATCH') || key.includes('TRANSIT')) return 'dispatch_pending';
  if (key.includes('ACCEPT') || key.includes('CONFIRM') || key.includes('READY')) return 'accepted';
  return 'pending';
}

export function mapSellerPurchaseOrder(row: {
  id: string;
  referenceNumber?: string;
  orderNumber?: string;
  status: string;
  paymentMethod?: string | null;
  totalAmount?: string | number | null;
  orderedQuantity?: string | number | null;
  quantity?: number;
  productName?: string;
  gradeName?: string;
  paymentStatus?: string | null;
  dispatchStatus?: string | null;
  shipmentStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
}): SellerOrder {
  const value = num(row.totalAmount);
  const quantity = num(row.quantity ?? row.orderedQuantity);
  const orderId = row.orderNumber ?? row.referenceNumber ?? row.id;
  const payKey = (row.paymentStatus ?? '').toUpperCase();
  return {
    id: row.id,
    orderId,
    material: row.productName ?? orderId,
    grade: row.gradeName ?? '—',
    quantity,
    destination: 'Assigned destination',
    warehouse: 'Assigned hub',
    port: '—',
    city: '—',
    value,
    unitPrice: quantity > 0 ? value / quantity : value,
    paymentMethod: mapPaymentMethod(row.paymentMethod),
    paymentStatus:
      payKey === 'VERIFIED' || payKey === 'PAID' || payKey === 'AUTHORIZED'
        ? 'completed'
        : 'pending',
    orderStatus: mapSellerStatus(
      row.shipmentStatus ?? row.dispatchStatus ?? row.status,
    ),
    buyerCreditEligible: false,
    buyerId: '',
    buyerName: 'Assigned buyer',
    buyerScore: 0,
    insuranceStatus: 'inactive',
    creditLimit: 0,
    tradeBehaviour: {
      orderFrequency: '—',
      returnRate: '—',
      averageOrderSize: '—',
      disputeStatus: '—',
    },
    createdAt: row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updatedAt ?? row.createdAt ?? new Date().toISOString(),
    dispatchLinkId: null,
    inventoryProductId: null,
    inventoryReserved: false,
    rejectionReason: null,
    rejectionRemarks: null,
    rejectedAt: null,
    acceptedAt: null,
  };
}

export async function fetchSellerPurchaseOrders(): Promise<SellerOrder[]> {
  try {
    const pages: SellerOrder[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const payload = await apiClient.get<Envelope<Parameters<typeof mapSellerPurchaseOrder>[0][]>>(
        `/seller/purchase-orders?page=${page}&limit=50`,
      );
      pages.push(...(payload.data.data ?? []).map(mapSellerPurchaseOrder));
      totalPages = payload.data.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages && page <= 10);
    return pages;
  } catch (error) {
    // Customer sessions / incomplete seller onboarding — treat as empty, not fatal.
    if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 403)) {
      return [];
    }
    throw error;
  }
}

function mapDocumentCategory(category?: string): DocumentCategory {
  const key = (category ?? '').toUpperCase();
  if (key.includes('INVOICE')) return 'invoice';
  if (key.includes('SETTLE')) return 'settlement';
  if (key.includes('PURCHASE') || key.includes('PO')) return 'purchase_order';
  if (key.includes('EWAY')) return 'eway_bill';
  if (key.includes('CERT')) return 'certificate';
  return 'compliance';
}

function mapDocumentStatus(status?: string): DocumentStatus {
  switch (status) {
    case 'APPROVED':
    case 'VERIFIED':
      return 'verified';
    case 'REJECTED':
      return 'rejected';
    case 'EXPIRED':
      return 'expired';
    default:
      return 'pending';
  }
}

export async function fetchSellerDocuments(): Promise<SellerDocumentItem[]> {
  const payload = await apiClient.get<Envelope<Array<{
    id: string;
    fileName?: string;
    originalFileName?: string;
    category?: string;
    status?: string;
    createdAt?: string;
    fileSizeBytes?: string | null;
    mimeType?: string | null;
  }>>>('/seller/documents?page=1&limit=100');
  return (payload.data.data ?? []).map((row) => ({
    id: row.id,
    name: row.originalFileName ?? row.fileName ?? 'Document',
    section: row.category ?? 'Documents',
    category: mapDocumentCategory(row.category),
    status: mapDocumentStatus(row.status),
    uploadDate: row.createdAt ?? new Date().toISOString(),
    fileSize: row.fileSizeBytes ? `${row.fileSizeBytes} B` : '—',
    fileType: (row.mimeType ?? '').includes('image') ? 'image' : 'pdf',
    previewUri: '',
    downloadUri: '',
  }));
}

export async function fetchSellerNotifications(): Promise<SellerNotificationsSnapshot> {
  const payload = await apiClient.get<Envelope<Array<{
    id: string;
    title: string;
    body: string;
    readAt?: string | null;
    createdAt: string;
    status?: string;
  }>>>('/seller/notifications?limit=50');
  const items = payload.data.data ?? [];
  const mapped: SellerNotification[] = items.map((row) => ({
    id: row.id,
    type: row.readAt ? 'activity' : 'action',
    category: 'orders',
    title: row.title,
    description: row.body,
    priority: row.readAt ? 'info' : 'warning',
    time: row.createdAt,
    isRead: Boolean(row.readAt),
    status: row.status,
  }));
  return {
    criticalActions: mapped.filter((item) => !item.isRead),
    recentActivity: mapped.filter((item) => item.isRead),
    archivedActivity: [],
  };
}

export async function markSellerNotificationRead(id: string) {
  await apiClient.post(`/seller/notifications/${id}/read`);
}

import { apiClient } from '@/api/client';
import { isOfflineBackendFallbackEnabled } from '@/config/development';
import {
  getCustomerNotificationMocks,
  getMockUnreadCount,
  markAllMockNotificationsRead,
  markMockNotificationRead,
} from '@/mock/notifications';
import { ROUTES } from '@/navigation/routes';
import { ensureDevBackendSession } from '@/services/backend-session';
import type {
  CustomerNotification,
  NotificationActionType,
  NotificationCategory,
  NotificationPriority,
  NotificationsPage,
} from '@/types/notifications';
import { logger } from '@/utils/logger';

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

type BackendNotification = {
  id: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  status?: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

type NotificationsSource = NotificationsPage['source'];

let activeSource: NotificationsSource = 'mock';

const CATEGORY_FILTER_MAP: Record<NotificationCategory, NotificationCategory[]> = {
  orders: ['orders'],
  purchase_requests: ['orders', 'purchase_requests'],
  seller_approval: ['orders', 'seller_approval'],
  payments: ['payments'],
  shipment: ['shipment'],
  documents: ['documents'],
  offers: ['offers'],
  promotions: ['offers', 'promotions'],
  marketplace: ['offers', 'marketplace'],
  credit: ['payments', 'credit'],
  system: ['system'],
};

const ENTITY_CATEGORY_MAP: Record<string, NotificationCategory> = {
  ORDER: 'orders',
  PURCHASE_ORDER: 'orders',
  PURCHASE_REQUEST: 'purchase_requests',
  PROCUREMENT: 'orders',
  PAYMENT: 'payments',
  CREDIT: 'credit',
  SHIPMENT: 'shipment',
  DOCUMENT: 'documents',
  OFFER: 'offers',
  PRODUCT: 'marketplace',
};

const ACTION_BY_CATEGORY: Record<NotificationCategory, NotificationActionType> = {
  orders: 'viewOrder',
  purchase_requests: 'viewRequest',
  seller_approval: 'viewOrder',
  payments: 'viewPayment',
  shipment: 'trackShipment',
  documents: 'viewDocument',
  offers: 'viewOffer',
  promotions: 'viewOffer',
  marketplace: 'viewOffer',
  credit: 'viewPayment',
  system: 'viewProfile',
};

const ACTION_LABELS: Record<NotificationActionType, string> = {
  viewOrder: 'View Order',
  viewRequest: 'View Request',
  trackShipment: 'Track Shipment',
  viewPayment: 'View Payment',
  viewDocument: 'View Document',
  viewOffer: 'View Offer',
  viewProfile: 'View Profile',
};

const ROUTE_BY_ACTION: Record<NotificationActionType, string> = {
  viewOrder: ROUTES.CUSTOMER.ORDERS,
  viewRequest: ROUTES.CUSTOMER.ORDERS,
  trackShipment: ROUTES.CUSTOMER.SHIPMENT_TRACKING,
  viewPayment: ROUTES.CUSTOMER.PAYMENT_REMINDER,
  viewDocument: ROUTES.CUSTOMER.PROFILE_TAX_DOCUMENTS,
  viewOffer: ROUTES.CUSTOMER.MARKET,
  viewProfile: ROUTES.CUSTOMER.PROFILE,
};

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null;

const asCategory = (value: unknown): NotificationCategory | null => {
  if (typeof value !== 'string') {
    return null;
  }
  return value in CATEGORY_FILTER_MAP ? (value as NotificationCategory) : null;
};

const inferCategoryFromTitle = (title: string): NotificationCategory => {
  const normalized = title.toLowerCase();
  if (normalized.includes('shipment') || normalized.includes('dispatch') || normalized.includes('truck')) {
    return 'shipment';
  }
  if (normalized.includes('payment') || normalized.includes('invoice') || normalized.includes('utr')) {
    return 'payments';
  }
  if (normalized.includes('credit')) {
    return 'credit';
  }
  if (normalized.includes('offer') || normalized.includes('sale') || normalized.includes('pricing')) {
    return 'offers';
  }
  if (normalized.includes('document') || normalized.includes('gst') || normalized.includes('certificate')) {
    return 'documents';
  }
  if (normalized.includes('request')) {
    return 'purchase_requests';
  }
  return 'orders';
};

const inferPriority = (isRead: boolean, title: string): NotificationPriority => {
  const normalized = title.toLowerCase();
  if (!isRead && (normalized.includes('overdue') || normalized.includes('failed') || normalized.includes('required'))) {
    return 'high';
  }
  if (!isRead) {
    return 'medium';
  }
  return 'low';
};

const resolveAction = (category: NotificationCategory): NotificationActionType =>
  ACTION_BY_CATEGORY[category];

export const getNotificationRoute = (notification: CustomerNotification): string =>
  notification.route || ROUTE_BY_ACTION[resolveAction(notification.category)];

const mapBackendNotification = (row: BackendNotification): CustomerNotification => {
  const metadata = row.metadata ?? {};
  const category =
    asCategory(metadata.category) ??
    ENTITY_CATEGORY_MAP[row.entityType ?? ''] ??
    inferCategoryFromTitle(row.title);
  const action = resolveAction(category);
  const isRead = Boolean(row.readAt) || row.status === 'READ';

  return {
    id: row.id,
    category,
    title: row.title,
    description: row.body,
    createdAt: row.createdAt,
    isRead,
    priority: inferPriority(isRead, row.title),
    reference:
      asString(metadata.reference) ??
      asString(metadata.orderNumber) ??
      asString(metadata.poNumber) ??
      asString(metadata.invoiceNumber) ??
      asString(row.entityId),
    actionLabel: ACTION_LABELS[action],
    route: asString(metadata.route) ?? ROUTE_BY_ACTION[action],
  };
};

const mockPage = (): NotificationsPage => {
  const items = getCustomerNotificationMocks();
  return {
    items,
    total: items.length,
    unreadCount: getMockUnreadCount(),
    source: 'mock',
  };
};

export async function fetchCustomerNotifications(): Promise<NotificationsPage> {
  try {
    await ensureDevBackendSession('customer');
    const payload = await apiClient.get<Envelope<BackendNotification[]>>(
      '/customer/notifications',
      { params: { page: 1, limit: 50 } },
    );
    const rows = payload.data.data ?? [];
    if (rows.length === 0 && isOfflineBackendFallbackEnabled()) {
      activeSource = 'mock';
      return mockPage();
    }

    const items = rows.map(mapBackendNotification);
    activeSource = 'api';
    return {
      items,
      total: payload.data.meta?.total ?? items.length,
      unreadCount: items.filter((item) => !item.isRead).length,
      source: 'api',
    };
  } catch (error) {
    logger.warn('Falling back to mock customer notifications', {
      message: error instanceof Error ? error.message : 'Unknown notifications error',
    });
    if (!isOfflineBackendFallbackEnabled()) {
      throw error;
    }
    activeSource = 'mock';
    return mockPage();
  }
}

export async function fetchCustomerUnreadCount(): Promise<number> {
  try {
    await ensureDevBackendSession('customer');
    const payload = await apiClient.get<Envelope<{ count: number }>>(
      '/customer/notifications/unread-count',
    );
    const count = payload.data.data?.count;
    if (typeof count === 'number' && count > 0) {
      return count;
    }
  } catch (error) {
    logger.warn('Unable to fetch unread notification count', {
      message: error instanceof Error ? error.message : 'Unknown unread count error',
    });
  }

  if (isOfflineBackendFallbackEnabled()) {
    return getMockUnreadCount();
  }
  return 0;
}

export async function markCustomerNotificationRead(id: string): Promise<void> {
  if (activeSource === 'mock') {
    markMockNotificationRead(id);
    return;
  }

  try {
    await ensureDevBackendSession('customer');
    await apiClient.post(`/customer/notifications/${id}/read`);
  } catch (error) {
    if (isOfflineBackendFallbackEnabled()) {
      markMockNotificationRead(id);
      return;
    }
    throw error;
  }
}

export async function markAllCustomerNotificationsRead(): Promise<void> {
  if (activeSource === 'mock') {
    markAllMockNotificationsRead();
    return;
  }

  try {
    await ensureDevBackendSession('customer');
    await apiClient.post('/customer/notifications/read-all');
  } catch (error) {
    if (isOfflineBackendFallbackEnabled()) {
      markAllMockNotificationsRead();
      return;
    }
    throw error;
  }
}

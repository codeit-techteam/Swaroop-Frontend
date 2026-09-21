export type NotificationCategoryFilter =
  | 'all'
  | 'orders'
  | 'payments'
  | 'shipment'
  | 'documents'
  | 'offers';

export type NotificationCategory =
  | 'orders'
  | 'purchase_requests'
  | 'seller_approval'
  | 'payments'
  | 'shipment'
  | 'documents'
  | 'offers'
  | 'promotions'
  | 'marketplace'
  | 'credit'
  | 'system';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationActionType =
  | 'viewOrder'
  | 'viewRequest'
  | 'trackShipment'
  | 'viewPayment'
  | 'viewDocument'
  | 'viewOffer'
  | 'viewProfile';

export type CustomerNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  priority: NotificationPriority;
  reference?: string | null;
  actionLabel: string;
  route: string;
};

export type NotificationDateGroup = {
  key: 'today' | 'yesterday' | 'earlier';
  label: string;
  items: CustomerNotification[];
};

export type NotificationsPage = {
  items: CustomerNotification[];
  total: number;
  unreadCount: number;
  source: 'api' | 'mock';
};

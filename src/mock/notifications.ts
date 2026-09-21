import { ROUTES } from '@/navigation/routes';
import type { CustomerNotification } from '@/types/notifications';

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const hoursAgo = (hours: number): string => minutesAgo(hours * 60);

export const CUSTOMER_NOTIFICATIONS_SEED: CustomerNotification[] = [
  {
    id: 'ntf-payment-reminder',
    category: 'payments',
    title: 'Payment Reminder',
    description: 'Outstanding balance on #INV-402 is overdue. Complete payment to keep credit active.',
    createdAt: minutesAgo(18),
    isRead: false,
    priority: 'high',
    reference: 'INV-402',
    actionLabel: 'View Payment',
    route: ROUTES.CUSTOMER.PAYMENT_REMINDER,
  },
  {
    id: 'ntf-shipment-update',
    category: 'shipment',
    title: 'Shipment Update',
    description: 'Order #ORD-99231 has departed Mundra Hub. Estimated arrival in 36 hours.',
    createdAt: minutesAgo(45),
    isRead: false,
    priority: 'medium',
    reference: 'ORD-99231',
    actionLabel: 'Track Shipment',
    route: ROUTES.CUSTOMER.SHIPMENT_TRACKING,
  },
  {
    id: 'ntf-purchase-request',
    category: 'purchase_requests',
    title: 'Purchase Request Submitted',
    description: '#PR-99104 for PP Raffia is awaiting seller confirmation.',
    createdAt: hoursAgo(2),
    isRead: false,
    priority: 'medium',
    reference: 'PR-99104',
    actionLabel: 'View Request',
    route: ROUTES.CUSTOMER.ORDERS,
  },
  {
    id: 'ntf-order-confirmed',
    category: 'seller_approval',
    title: 'Order Confirmed',
    description: 'Purchase request #PR-98822 approved. Purchase order has been generated.',
    createdAt: hoursAgo(6),
    isRead: true,
    priority: 'low',
    reference: 'PR-98822',
    actionLabel: 'View Order',
    route: ROUTES.CUSTOMER.ORDERS,
  },
  {
    id: 'ntf-gst-invoice',
    category: 'documents',
    title: 'GST Invoice Ready',
    description: 'GST invoice for #ORD-98822 is ready to download from Tax Documents.',
    createdAt: hoursAgo(20),
    isRead: true,
    priority: 'low',
    reference: 'GST-INV-2026-98822',
    actionLabel: 'View Document',
    route: ROUTES.CUSTOMER.PROFILE_TAX_DOCUMENTS,
  },
  {
    id: 'ntf-flash-offer',
    category: 'offers',
    title: 'Limited Time Pricing',
    description: 'PP Raffia from Jamnagar Hub is available at a reduced landed cost until tonight.',
    createdAt: hoursAgo(28),
    isRead: true,
    priority: 'medium',
    reference: 'LTP-2026-110',
    actionLabel: 'View Offer',
    route: ROUTES.CUSTOMER.MARKET,
  },
  {
    id: 'ntf-payment-approved',
    category: 'payments',
    title: 'Payment Approved',
    description: 'UTR for #PAY-2026-00512 has been verified. Your order will move to dispatch.',
    createdAt: hoursAgo(36),
    isRead: true,
    priority: 'low',
    reference: 'PAY-2026-00512',
    actionLabel: 'View Payment',
    route: ROUTES.CUSTOMER.ORDERS,
  },
  {
    id: 'ntf-credit-limit',
    category: 'credit',
    title: 'Credit Limit Increased',
    description: 'Your PetroTrade credit limit has been revised. Review the updated terms in your profile.',
    createdAt: hoursAgo(52),
    isRead: true,
    priority: 'low',
    reference: 'CR-INC-2026-018',
    actionLabel: 'View Profile',
    route: ROUTES.CUSTOMER.PROFILE,
  },
];

const cloneNotifications = (): CustomerNotification[] =>
  JSON.parse(JSON.stringify(CUSTOMER_NOTIFICATIONS_SEED)) as CustomerNotification[];

let notificationsState = cloneNotifications();

export const resetCustomerNotificationMocks = (): void => {
  notificationsState = cloneNotifications();
};

export const getCustomerNotificationMocks = (): CustomerNotification[] =>
  notificationsState.map((item) => ({ ...item }));

export const getMockUnreadCount = (): number =>
  notificationsState.filter((item) => !item.isRead).length;

export const markMockNotificationRead = (id: string): void => {
  notificationsState = notificationsState.map((item) =>
    item.id === id ? { ...item, isRead: true } : item,
  );
};

export const markAllMockNotificationsRead = (): void => {
  notificationsState = notificationsState.map((item) => ({ ...item, isRead: true }));
};

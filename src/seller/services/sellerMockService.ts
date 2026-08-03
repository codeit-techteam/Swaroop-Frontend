import { SELLER_NOTIFICATIONS_SEED } from '@/seller/mock/notifications';
import { SELLER_PROFILE_SEED } from '@/seller/mock/profile';
import {
  SELLER_SHIPMENT_ANALYTICS_SEED,
  SELLER_SHIPMENTS_SEED,
} from '@/seller/mock/shipments';
import type {
  NotificationCategoryFilter,
  SellerNotification,
  SellerNotificationsSnapshot,
} from '@/seller/types/notifications';
import type { SellerProfileData } from '@/seller/types/profile';
import type {
  ActiveShipment,
  ShipmentAnalytics,
  ShipmentDashboardPreview,
  ShipmentFilterTab,
} from '@/seller/types/shipments';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const cloneNotificationsSnapshot = (): SellerNotificationsSnapshot =>
  JSON.parse(JSON.stringify(SELLER_NOTIFICATIONS_SEED)) as SellerNotificationsSnapshot;

const cloneShipments = (): ActiveShipment[] =>
  JSON.parse(JSON.stringify(SELLER_SHIPMENTS_SEED)) as ActiveShipment[];

let notificationsState = cloneNotificationsSnapshot();
let shipmentsState = cloneShipments();

export const resetSellerMockState = (): void => {
  notificationsState = cloneNotificationsSnapshot();
  shipmentsState = cloneShipments();
};

export const getSellerProfile = (): SellerProfileData => ({ ...SELLER_PROFILE_SEED });

export const getSellerNotificationsSnapshot = (): SellerNotificationsSnapshot => ({
  criticalActions: [...notificationsState.criticalActions],
  recentActivity: [...notificationsState.recentActivity],
  archivedActivity: [...notificationsState.archivedActivity],
});

export const filterNotificationsByCategory = (
  notifications: SellerNotification[],
  category: NotificationCategoryFilter,
): SellerNotification[] => {
  if (category === 'all') {
    return notifications;
  }
  return notifications.filter((notification) => notification.category === category);
};

export const getUnreadNotificationCount = (): number => {
  const snapshot = getSellerNotificationsSnapshot();
  return [...snapshot.criticalActions, ...snapshot.recentActivity, ...snapshot.archivedActivity].filter(
    (notification) => !notification.isRead,
  ).length;
};

export const markNotificationRead = (notificationId: string): void => {
  const updateList = (list: SellerNotification[]) =>
    list.map((notification) =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification,
    );

  notificationsState = {
    criticalActions: updateList(notificationsState.criticalActions),
    recentActivity: updateList(notificationsState.recentActivity),
    archivedActivity: updateList(notificationsState.archivedActivity),
  };
};

export const deleteNotification = (notificationId: string): void => {
  const removeFromList = (list: SellerNotification[]) =>
    list.filter((notification) => notification.id !== notificationId);

  notificationsState = {
    criticalActions: removeFromList(notificationsState.criticalActions),
    recentActivity: removeFromList(notificationsState.recentActivity),
    archivedActivity: removeFromList(notificationsState.archivedActivity),
  };
};

export const loadMoreNotifications = (): SellerNotification[] => {
  const batch = notificationsState.archivedActivity.slice(0, 2);
  notificationsState = {
    ...notificationsState,
    archivedActivity: notificationsState.archivedActivity.slice(2),
    recentActivity: [...notificationsState.recentActivity, ...batch],
  };
  return batch;
};

export const refreshSellerNotifications = async (): Promise<SellerNotificationsSnapshot> => {
  await delay(900);
  return getSellerNotificationsSnapshot();
};

export const getShipmentAnalytics = (): ShipmentAnalytics => ({ ...SELLER_SHIPMENT_ANALYTICS_SEED });

export const getActiveShipments = (): ActiveShipment[] => [...shipmentsState];

export const getShipmentById = (shipmentId: string): ActiveShipment | undefined =>
  shipmentsState.find((shipment) => shipment.id === shipmentId);

export const filterShipmentsByTab = (
  shipments: ActiveShipment[],
  tab: ShipmentFilterTab,
): ActiveShipment[] => shipments.filter((shipment) => shipment.filterStatus === tab);

export const getDashboardShipmentPreviews = (): ShipmentDashboardPreview[] =>
  shipmentsState
    .filter((shipment) => shipment.filterStatus === 'in_transit')
    .slice(0, 3)
    .map((shipment) => ({
      id: shipment.id,
      shipmentId: shipment.orderId,
      route: shipment.route,
      status:
        shipment.status === 'DELAYED'
          ? 'Delayed'
          : shipment.status === 'LIVE'
            ? 'In Transit'
            : 'On Time',
      eta: shipment.etaLabel,
    }));

export const getActiveShipmentCount = (): number =>
  shipmentsState.filter((shipment) => shipment.filterStatus === 'in_transit').length;

export const refreshSellerShipments = async (): Promise<ActiveShipment[]> => {
  await delay(900);
  return getActiveShipments();
};

export const simulateDocumentDownload = async (documentTitle: string): Promise<string> => {
  await delay(500);
  return `${documentTitle} download started`;
};

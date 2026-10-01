export type NotificationCategoryFilter =
  | 'all'
  | 'orders'
  | 'payments'
  | 'dispatch'
  | 'credit'
  | 'inventory';

export type NotificationCategory = Exclude<NotificationCategoryFilter, 'all'>;

export type NotificationPriority = 'critical' | 'warning' | 'info';

export type NotificationItemType = 'action' | 'activity';

export type NotificationActionVariant = 'primary' | 'secondary' | 'danger';

export type SellerNotificationAction = {
  id: string;
  label: string;
  variant: NotificationActionVariant;
  route?: string;
};

export type SellerNotification = {
  id: string;
  type: NotificationItemType;
  category: NotificationCategory;
  title: string;
  description: string;
  priority?: NotificationPriority;
  time: string;
  isRead: boolean;
  actionText?: string;
  status?: string;
  actions?: SellerNotificationAction[];
  /** In-app destination when the row itself is tapped (e.g. an Import deal). */
  route?: string;
};

export type SellerNotificationsSnapshot = {
  criticalActions: SellerNotification[];
  recentActivity: SellerNotification[];
  archivedActivity: SellerNotification[];
};

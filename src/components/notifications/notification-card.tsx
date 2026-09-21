import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import {
  AlertCircleIcon,
  ClipboardCheckIcon,
  CurrencyIcon,
  DocumentFileIcon,
  LightningIcon,
  TruckIcon,
  WalletIcon,
} from '@/icons';
import { brandColors } from '@/theme/colors';
import type { CustomerNotification, NotificationCategory } from '@/types/notifications';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/date';

type NotificationCardProps = {
  notification: CustomerNotification;
  onPress: () => void;
  onActionPress: () => void;
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  orders: 'Orders',
  purchase_requests: 'Purchase Request',
  seller_approval: 'Order Confirmation',
  payments: 'Payments',
  shipment: 'Shipment',
  documents: 'Documents',
  offers: 'Offers',
  promotions: 'Promotions',
  marketplace: 'Marketplace',
  credit: 'Credit',
  system: 'System',
};

const categoryIcon = (category: NotificationCategory, highPriority: boolean): ReactNode => {
  if (highPriority) {
    return <AlertCircleIcon size={18} color={brandColors.error} />;
  }

  switch (category) {
    case 'shipment':
      return <TruckIcon size={18} color={brandColors.primaryDark} />;
    case 'payments':
      return <CurrencyIcon size={18} color={brandColors.body} />;
    case 'credit':
      return <WalletIcon size={18} color={brandColors.body} />;
    case 'documents':
      return <DocumentFileIcon size={18} color={brandColors.body} />;
    case 'offers':
    case 'promotions':
    case 'marketplace':
      return <LightningIcon size={18} color={brandColors.primaryDark} />;
    default:
      return <ClipboardCheckIcon size={18} color={brandColors.body} />;
  }
};

const categoryAccent = (category: NotificationCategory, highPriority: boolean): string => {
  if (highPriority) {
    return 'bg-brand-error-light';
  }
  if (category === 'shipment') {
    return 'bg-brand-primary-light';
  }
  if (category === 'offers' || category === 'promotions' || category === 'marketplace') {
    return 'bg-[#FEF3E8]';
  }
  return 'bg-brand-surface';
};

export const NotificationCard = memo(function NotificationCard({
  notification,
  onPress,
  onActionPress,
}: NotificationCardProps) {
  const unread = !notification.isRead;
  const highPriority = unread && notification.priority === 'high';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.description}`}
      className={cn(
        'rounded-2xl border p-lg',
        unread ? 'border-brand-primary/30 bg-brand-primary-tint' : 'border-brand-border bg-brand-white',
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className="flex-row items-start">
        <View
          className={cn(
            'mr-md h-11 w-11 items-center justify-center rounded-xl',
            categoryAccent(notification.category, highPriority),
          )}
        >
          {categoryIcon(notification.category, highPriority)}
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-sm">
            <Typography variant="badge" className="text-[10px] uppercase tracking-wide text-brand-body">
              {CATEGORY_LABELS[notification.category]}
            </Typography>
            <View className="flex-row items-center gap-xs">
              <Typography variant="legal" className="text-brand-body">
                {formatRelativeTime(notification.createdAt)}
              </Typography>
              {unread ? <View className="h-2 w-2 rounded-full bg-brand-notification-dot" /> : null}
            </View>
          </View>

          <Typography
            variant="roleTitle"
            className={cn('mt-xs text-[15px]', unread ? 'text-brand-heading' : 'text-brand-heading')}
          >
            {notification.title}
          </Typography>

          {notification.reference ? (
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              {notification.reference}
            </Typography>
          ) : null}

          <Typography variant="roleDescription" className="mt-xs" numberOfLines={2}>
            {notification.description}
          </Typography>

          <Pressable
            onPress={onActionPress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={notification.actionLabel}
            className="mt-md self-start rounded-lg border border-brand-border bg-brand-white px-md py-xs"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Typography variant="link" className="text-[12px] font-semibold text-brand-primary">
              {notification.actionLabel}
            </Typography>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

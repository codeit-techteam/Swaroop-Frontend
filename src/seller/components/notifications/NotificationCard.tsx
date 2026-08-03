import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import {
  AlertCircleIcon,
  ClipboardCheckIcon,
  CurrencyIcon,
  DocumentFileIcon,
  TruckIcon,
  WalletIcon,
} from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

import { NotificationBadge } from '@/seller/components/notifications/NotificationBadge';
import { SellerPrimaryButton } from '@/seller/components/SellerPrimitives';
import type { SellerNotification } from '@/seller/types/notifications';

type NotificationCardProps = {
  notification: SellerNotification;
  onActionPress?: (actionId: string) => void;
  onPress?: () => void;
  showUnreadDot?: boolean;
};

const categoryIconMap: Record<SellerNotification['category'], ReactNode> = {
  dispatch: <TruckIcon size={18} color={brandColors.primaryDark} />,
  payments: <CurrencyIcon size={18} color={brandColors.body} />,
  orders: <DocumentFileIcon size={18} color={brandColors.body} />,
  credit: <WalletIcon size={18} color={brandColors.body} />,
  inventory: <ClipboardCheckIcon size={18} color={brandColors.body} />,
};

const categoryAccentMap: Record<SellerNotification['category'], string> = {
  dispatch: 'bg-brand-primary-light',
  payments: 'bg-brand-surface',
  orders: 'bg-brand-surface',
  credit: 'bg-brand-surface',
  inventory: 'bg-[#FEF3E8]',
};

export const NotificationActionCard = memo(function NotificationActionCard({
  notification,
  onActionPress,
}: NotificationCardProps) {
  const priority = notification.priority ?? 'info';

  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-start justify-between">
        <View
          className={cn(
            'mr-md h-12 w-12 items-center justify-center rounded-xl',
            priority === 'critical' ? 'bg-brand-error-light' : 'bg-[#FEF3E8]',
          )}
        >
          {priority === 'critical' ? (
            <AlertCircleIcon size={20} color={brandColors.error} />
          ) : (
            <ClipboardCheckIcon size={20} color="#B45309" />
          )}
        </View>
        {notification.status ? (
          <NotificationBadge
            label={notification.status}
            priority={priority === 'critical' ? 'critical' : 'warning'}
          />
        ) : null}
      </View>

      <Typography variant="roleTitle" className="mt-md text-[16px]">
        {notification.title}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs">
        {notification.description}
      </Typography>

      {notification.actions?.length ? (
        <View className="mt-lg flex-row flex-wrap items-center gap-md">
          {notification.actions.map((action) => {
            if (action.variant === 'primary') {
              return (
                <SellerPrimaryButton
                  key={action.id}
                  label={action.label}
                  onPress={() => onActionPress?.(action.id)}
                  className="min-w-[140px] flex-1"
                />
              );
            }

            return (
              <Pressable
                key={action.id}
                onPress={() => onActionPress?.(action.id)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Typography
                  variant="roleTitle"
                  className={cn(
                    'text-[14px]',
                    action.variant === 'danger' ? 'text-brand-error' : 'text-brand-primary',
                  )}
                >
                  {action.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
});

export const NotificationActivityItem = memo(function NotificationActivityItem({
  notification,
  onPress,
  showUnreadDot = true,
}: NotificationCardProps) {
  const unread = showUnreadDot && !notification.isRead;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-start px-lg py-md"
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        className={cn(
          'mr-md h-11 w-11 items-center justify-center rounded-xl',
          categoryAccentMap[notification.category],
        )}
      >
        {categoryIconMap[notification.category]}
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-sm">
          <Typography variant="badge" className="text-[10px] uppercase tracking-wide text-brand-body">
            {notification.category}
          </Typography>
          <View className="flex-row items-center gap-xs">
            <Typography variant="legal" className="text-brand-body">
              {notification.time}
            </Typography>
            {unread ? <View className="h-2 w-2 rounded-full bg-brand-navy" /> : null}
          </View>
        </View>
        <Typography variant="roleTitle" className="mt-xs text-[15px]">
          {notification.title}
        </Typography>
        <Typography variant="roleDescription" className="mt-xs">
          {notification.description}
        </Typography>
      </View>
    </Pressable>
  );
});

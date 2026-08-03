import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { BellIcon } from '@/icons';
import { cn } from '@/utils/cn';

export const SettlementNotificationBell = memo(function SettlementNotificationBell({
  unreadCount,
  onPress,
}: {
  unreadCount: number;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="relative rounded-full p-sm">
      <BellIcon />
      {unreadCount > 0 ? (
        <View className="absolute right-1 top-1 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-brand-error px-[4px]">
          <Typography variant="badge" className="text-[9px] text-brand-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Typography>
        </View>
      ) : null}
    </Pressable>
  );
});

export const SettlementNotificationPanel = memo(function SettlementNotificationPanel({
  notifications,
  onMarkAllRead,
  onMarkRead,
}: {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
  }>;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}) {
  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
      <View className="mb-md flex-row items-center justify-between">
        <Typography variant="headingLeft" className="text-[18px]">
          Notifications
        </Typography>
        <Pressable onPress={onMarkAllRead}>
          <Typography variant="link">Mark all read</Typography>
        </Pressable>
      </View>
      <View className="gap-sm">
        {notifications.slice(0, 5).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onMarkRead(item.id)}
            className={cn(
              'rounded-xl px-md py-md',
              item.read ? 'bg-brand-surface' : 'bg-brand-primary-light',
            )}
          >
            <Typography variant="roleTitle">{item.title}</Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              {item.message}
            </Typography>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

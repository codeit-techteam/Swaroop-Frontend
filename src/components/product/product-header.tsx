import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import { AppLogo } from '@/components/ui/app-logo';
import { Typography } from '@/components/ui/typography';
import { BackArrowIcon, BellIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type ProductHeaderProps = {
  avatarInitials?: string;
  hasNotification?: boolean;
  onBackPress: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  className?: string;
};

export const ProductHeader = memo(function ProductHeader({
  avatarInitials = 'PD',
  hasNotification = true,
  onBackPress,
  onNotificationPress,
  onProfilePress,
  className,
}: ProductHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={onBackPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-xs h-10 w-8 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.heading} />
          </Pressable>
          <AppLogo color={brandColors.heading} />
        </View>

        <View className="flex-row items-center gap-sm">
          <Pressable
            onPress={onNotificationPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="h-10 w-10 items-center justify-center"
          >
            <BellIcon color={brandColors.heading} />
            <NotificationBadge visible={hasNotification} />
          </Pressable>

          <Pressable
            onPress={onProfilePress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            className="h-9 w-9 items-center justify-center rounded-full bg-brand-primary-light"
          >
            <Typography variant="badge" className="text-[11px] text-brand-heading">
              {avatarInitials}
            </Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

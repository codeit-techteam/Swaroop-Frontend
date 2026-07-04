import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import { AppLogo } from '@/components/ui/app-logo';
import { BellIcon, HelpIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type HomeHeaderProps = {
  hasNotification?: boolean;
  onHelpPress?: () => void;
  onNotificationPress?: () => void;
  className?: string;
};

export const HomeHeader = memo(function HomeHeader({
  hasNotification = true,
  onHelpPress,
  onNotificationPress,
  className,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('w-full bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-between">
        <AppLogo />

        <View className="flex-row items-center gap-sm">
          <Pressable
            onPress={onHelpPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Help"
            className="h-10 w-10 items-center justify-center"
          >
            <HelpIcon color={brandColors.primary} />
          </Pressable>

          <Pressable
            onPress={onNotificationPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="h-10 w-10 items-center justify-center"
          >
            <BellIcon color={brandColors.primary} />
            <NotificationBadge visible={hasNotification} />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

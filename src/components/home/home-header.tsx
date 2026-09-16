import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import { AppLogo } from '@/components/ui/app-logo';
import { BellIcon, CartIcon } from '@/icons';
import { selectCartCount, useCartStore } from '@/store/cart-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type HomeHeaderProps = {
  hasNotification?: boolean;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
  className?: string;
};

export const HomeHeader = memo(function HomeHeader({
  hasNotification = true,
  onCartPress,
  onNotificationPress,
  className,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore(selectCartCount);

  return (
    <View
      className={cn('w-full bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-between">
        <AppLogo />

        <View className="flex-row items-center gap-sm">
          {onCartPress ? (
            <Pressable
              onPress={onCartPress}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              className="h-10 w-10 items-center justify-center"
            >
              <CartIcon size={iconSizes.lg} color={brandColors.primary} />
              <NotificationBadge visible={cartCount > 0} />
            </Pressable>
          ) : null}

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

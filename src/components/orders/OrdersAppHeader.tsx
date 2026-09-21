import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { DEFAULT_DELIVERY_LOCATION } from '@/constants/dashboard';
import { AppLogo } from '@/components/ui/app-logo';
import { LocationPinIcon, ProfileIcon } from '@/icons';
import { selectLocation, useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type OrdersAppHeaderProps = {
  onLocationPress?: () => void;
  onProfilePress?: () => void;
  className?: string;
};

export const OrdersAppHeader = memo(function OrdersAppHeader({
  onLocationPress,
  onProfilePress,
  className,
}: OrdersAppHeaderProps) {
  const insets = useSafeAreaInsets();
  const persistedLocation = useAuthStore(selectLocation);
  const location = persistedLocation ?? DEFAULT_DELIVERY_LOCATION;

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 flex-row items-center justify-between px-lg">
        <AppLogo />

        <Pressable
          onPress={onLocationPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Delivery location ${location.label}`}
          className="mx-sm min-w-0 flex-1 flex-row items-center justify-center gap-xs"
        >
          <LocationPinIcon size={iconSizes.sm} color={brandColors.primary} />
          <Typography
            variant="roleTitle"
            className="text-[13px] text-brand-primary"
            numberOfLines={1}
          >
            {location.label}
          </Typography>
        </Pressable>

        <Pressable
          onPress={onProfilePress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          className="h-10 w-10 items-center justify-center"
        >
          <ProfileIcon size={iconSizes.lg} color={brandColors.primary} />
        </Pressable>
      </View>
    </View>
  );
});

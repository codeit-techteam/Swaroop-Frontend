import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import { Typography } from '@/components/ui/typography';
import { MARKET_LOCATION_LABEL } from '@/constants/marketProducts';
import { CartIcon, FactoryLogo, LocationPinIcon } from '@/icons';
import { selectCartCount, useCartStore } from '@/store/cart-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type MarketHeaderProps = {
  locationLabel?: string;
  onLocationPress?: () => void;
  onCartPress?: () => void;
  className?: string;
};

export const MarketHeader = memo(function MarketHeader({
  locationLabel = MARKET_LOCATION_LABEL,
  onLocationPress,
  onCartPress,
  className,
}: MarketHeaderProps) {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore(selectCartCount);

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-between">
        <View
          className="flex-row items-center gap-sm"
          accessibilityRole="header"
          accessibilityLabel="PetroTrade India"
        >
          <FactoryLogo size={iconSizes.logoSmall} color={brandColors.primary} />
          <Typography variant="logo" className="text-[15px] text-brand-primary">
            PetroTrade India
          </Typography>
        </View>

        <View className="flex-row items-center gap-sm">
          <Pressable
            onPress={onLocationPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Location ${locationLabel}`}
            className="flex-row items-center gap-xs"
          >
            <LocationPinIcon size={iconSizes.sm} color={brandColors.muted} />
            <Typography
              variant="roleTitle"
              className="font-semibold text-[13px] text-brand-body"
              numberOfLines={1}
            >
              {locationLabel}
            </Typography>
          </Pressable>

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
        </View>
      </View>
    </View>
  );
});

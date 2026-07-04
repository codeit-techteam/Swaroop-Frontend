import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { MARKET_LOCATION_LABEL } from '@/constants/marketProducts';
import { FactoryLogo, LocationPinIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type MarketHeaderProps = {
  locationLabel?: string;
  onLocationPress?: () => void;
  className?: string;
};

export const MarketHeader = memo(function MarketHeader({
  locationLabel = MARKET_LOCATION_LABEL,
  onLocationPress,
  className,
}: MarketHeaderProps) {
  const insets = useSafeAreaInsets();

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
      </View>
    </View>
  );
});

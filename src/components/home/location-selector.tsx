import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ChevronDownIcon, LocationPinIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { DeliveryLocation } from '@/types/home';
import { cn } from '@/utils/cn';

type LocationSelectorProps = {
  location: DeliveryLocation;
  onPress: () => void;
  className?: string;
};

export const LocationSelector = memo(function LocationSelector({
  location,
  onPress,
  className,
}: LocationSelectorProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Delivering to ${location.label}`}
      className={cn('flex-row items-start gap-sm px-lg py-sm', className)}
    >
      <View className="mt-0.5">
        <LocationPinIcon color={brandColors.muted} />
      </View>

      <View className="flex-1">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[1.2px] text-brand-muted">
          DELIVERING TO
        </Typography>
        <View className="mt-0.5 flex-row items-center gap-xs">
          <Typography
            variant="roleTitle"
            className="text-[15px] text-brand-primary"
            numberOfLines={1}
          >
            {location.label}
          </Typography>
          <ChevronDownIcon color={brandColors.primary} />
        </View>
      </View>
    </Pressable>
  );
});

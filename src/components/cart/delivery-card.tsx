import { memo } from 'react';

import { Pressable, View } from 'react-native';


import { Typography } from '@/components/ui/typography';
import { TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import type { CartDeliveryLocation } from '@/types/product';
import { cn } from '@/utils/cn';

type DeliveryCardProps = {
  delivery: CartDeliveryLocation;
  onChangePress: () => void;
  className?: string;
};

export const DeliveryCard = memo(function DeliveryCard({
  delivery,
  onChangePress,
  className,
}: DeliveryCardProps) {
  return (
    <View

      className={cn(
        'mx-lg flex-row items-center rounded-2xl border border-brand-border bg-brand-white p-md',
        className,
      )}
      style={elevation.sm}
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-light">
        <TruckIcon size={iconSizes.md} color={brandColors.primary} />
      </View>

      <View className="ml-md flex-1">
        <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
          Delivery to {delivery.city}
        </Typography>
        <View className="mt-xs flex-row items-center">
          <View className="mr-xs h-1.5 w-1.5 rounded-full bg-brand-success" />
          <Typography variant="roleDescription" className="text-[12px] text-brand-body">
            Estimated Delivery: {delivery.etaLabel}
          </Typography>
        </View>
      </View>

      <Pressable
        onPress={onChangePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Change delivery location"
        className="px-sm py-xs"
      >
        <Typography variant="link" className="font-semibold text-[13px] text-brand-primary">
          Change
        </Typography>
      </Pressable>
    </View>
  );
});

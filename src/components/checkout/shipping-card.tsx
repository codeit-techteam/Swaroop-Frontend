import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { LocationPinIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import type { CheckoutShippingAddress } from '@/types/checkout';
import { cn } from '@/utils/cn';

type ShippingCardProps = {
  address: CheckoutShippingAddress;
  onEditPress: () => void;
  className?: string;
};

export const ShippingCard = memo(function ShippingCard({
  address,
  onEditPress,
  className,
}: ShippingCardProps) {
  return (
    <Animated.View
      key={address.id}
      entering={FadeInDown.delay(80).duration(360).springify().damping(18)}
      className={cn('mx-lg rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="mb-md flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TruckIcon size={iconSizes.sm} color={brandColors.primary} />
          <Typography
            variant="fieldLabel"
            className="ml-sm text-[11px] tracking-[1px] text-brand-muted"
          >
            SHIPPING TO
          </Typography>
        </View>

        <Pressable
          onPress={onEditPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit shipping address"
          className="px-xs py-xs"
        >
          <Typography variant="link" className="font-semibold text-[13px] text-brand-primary">
            Edit
          </Typography>
        </Pressable>
      </View>

      <Animated.View entering={FadeInRight.duration(280)}>
        <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
          {address.warehouseName}
        </Typography>
        <Typography variant="roleDescription" className="mt-sm text-[13px] leading-5 text-brand-body">
          {address.line1}
        </Typography>
        <Typography variant="roleDescription" className="text-[13px] leading-5 text-brand-body">
          {address.line2}
        </Typography>
        <Typography variant="roleDescription" className="text-[13px] leading-5 text-brand-body">
          {address.state} - {address.pincode}
        </Typography>
      </Animated.View>

      <View className="mt-md self-start flex-row items-center rounded-full bg-brand-surface px-sm py-xs">
        <LocationPinIcon size={iconSizes.xs} color={brandColors.muted} />
        <Typography variant="roleDescription" className="ml-xs text-[11px] text-brand-body">
          {address.zoneLabel}
        </Typography>
      </View>
    </Animated.View>
  );
});

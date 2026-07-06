import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { CartIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type EmptyCartProps = {
  onBrowsePress: () => void;
  className?: string;
};

export const EmptyCart = memo(function EmptyCart({ onBrowsePress, className }: EmptyCartProps) {
  return (
    <View className={cn('flex-1 items-center justify-center px-xl', className)}>
      <View className="mb-lg h-28 w-28 items-center justify-center rounded-full bg-brand-primary-light">
        <CartIcon size={iconSizes['2xl']} color={brandColors.primary} />
      </View>

      <Typography variant="headingLeft" className="text-center text-[22px] text-brand-heading">
        Your Cart is Empty
      </Typography>

      <Typography
        variant="subheadingLeft"
        className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
      >
        Browse industrial materials and add products to start your order.
      </Typography>

      <Pressable
        onPress={onBrowsePress}
        accessibilityRole="button"
        accessibilityLabel="Browse marketplace"
        className="mt-xl h-12 items-center justify-center rounded-xl bg-brand-heading px-xl"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <Typography variant="button" className="text-[14px] tracking-normal">
          Browse Marketplace
        </Typography>
      </Pressable>
    </View>
  );
});

import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuantitySelector } from '@/components/product/quantity-selector';
import { Typography } from '@/components/ui/typography';
import { ArrowRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type BottomActionBarProps = {
  quantityMt: number;
  minMt: number;
  increment: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  className?: string;
};

export const BottomActionBar = memo(function BottomActionBar({
  quantityMt,
  minMt,
  increment,
  onIncrement,
  onDecrement,
  onAddToCart,
  onBuyNow,
  className,
}: BottomActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn(
        'border-t border-brand-border bg-brand-white px-lg pt-md shadow-sm',
        className,
      )}
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <QuantitySelector
          quantityMt={quantityMt}
          minMt={minMt}
          increment={increment}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />

        <Pressable
          onPress={onAddToCart}
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
          className="h-11 flex-1 items-center justify-center rounded-lg border border-brand-heading bg-brand-white px-sm"
        >
          <Typography variant="button" className="text-[13px] tracking-normal text-brand-heading">
            Add to Cart
          </Typography>
        </Pressable>

        <Pressable
          onPress={onBuyNow}
          accessibilityRole="button"
          accessibilityLabel="Buy now"
          className="h-11 flex-1 flex-row items-center justify-center rounded-lg bg-brand-heading px-sm"
        >
          <Typography variant="button" className="mr-xs text-[13px] tracking-normal">
            Buy Now
          </Typography>
          <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
        </Pressable>
      </View>
    </View>
  );
});

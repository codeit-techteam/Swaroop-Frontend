import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuantitySelector } from '@/components/product/quantity-selector';
import { Typography } from '@/components/ui/typography';
import { formatInr } from '@/constants/productDetails';
import { ArrowRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type BottomActionBarProps = {
  quantityMt: number;
  minMt: number;
  maxMt: number;
  increment: number;
  estimatedTotal: number;
  disabled?: boolean;
  quoting?: boolean;
  adding?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  className?: string;
};

export const BottomActionBar = memo(function BottomActionBar({
  quantityMt,
  minMt,
  maxMt,
  increment,
  estimatedTotal,
  disabled = false,
  quoting = false,
  adding = false,
  onIncrement,
  onDecrement,
  onAddToCart,
  onBuyNow,
  className,
}: BottomActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('border-t border-brand-border bg-brand-white px-lg pt-md shadow-sm', className)}
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="mb-sm flex-row items-end justify-between">
        <Typography
          variant="caption"
          className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
        >
          Est. total · {quantityMt} MT
        </Typography>
        <Typography variant="roleTitle" className="text-[16px] text-brand-primary">
          {quoting ? 'Calculating total...' : formatInr(estimatedTotal)}
        </Typography>
      </View>
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <QuantitySelector
          quantityMt={quantityMt}
          minMt={minMt}
          maxMt={maxMt}
          increment={increment}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />

        <Pressable
          onPress={onAddToCart}
          disabled={disabled || adding || quoting}
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
          className={cn(
            'h-11 flex-1 items-center justify-center rounded-lg border px-sm',
            disabled || adding || quoting
              ? 'border-brand-border bg-brand-surface'
              : 'border-brand-heading bg-brand-white',
          )}
        >
          <Typography
            variant="button"
            className={cn(
              'text-[13px] tracking-normal',
              disabled || adding || quoting ? 'text-brand-muted' : 'text-brand-heading',
            )}
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </Typography>
        </Pressable>

        <Pressable
          onPress={onBuyNow}
          disabled={disabled || quoting}
          accessibilityRole="button"
          accessibilityLabel="Buy now"
          className={cn(
            'h-11 flex-1 flex-row items-center justify-center rounded-lg px-sm',
            disabled || quoting ? 'bg-brand-disabled' : 'bg-brand-heading',
          )}
        >
          <Typography variant="button" className="mr-xs text-[13px] tracking-normal">
            {quoting ? 'Getting latest price...' : 'Buy Now'}
          </Typography>
          <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
        </Pressable>
      </View>
    </View>
  );
});

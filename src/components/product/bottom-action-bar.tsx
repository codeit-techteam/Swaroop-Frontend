import { memo } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

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
  refreshing?: boolean;
  lockingPrice?: boolean;
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
  refreshing = false,
  lockingPrice = false,
  adding = false,
  onIncrement,
  onDecrement,
  onAddToCart,
  onBuyNow,
  className,
}: BottomActionBarProps) {
  const insets = useSafeAreaInsets();
  const hasTotal = estimatedTotal > 0;
  const addDisabled = disabled || adding;
  const buyDisabled = disabled || lockingPrice;

  return (
    <View
      className={cn('border-t border-brand-border bg-brand-white px-lg pt-md shadow-sm', className)}
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="mb-sm flex-row items-end justify-between">
        <View className="mr-sm min-w-0 flex-1">
          <Typography
            variant="caption"
            className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
          >
            Est. total · {quantityMt} MT
          </Typography>
          {refreshing ? (
            <Typography
              variant="caption"
              className="mt-0.5 font-sans text-[10px] normal-case tracking-normal text-brand-primary"
            >
              Confirming latest price
            </Typography>
          ) : null}
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View style={{ width: 16, height: 16 }} accessibilityElementsHidden={!refreshing}>
            {refreshing ? <ActivityIndicator size="small" color={brandColors.primary} /> : null}
          </View>
          <Typography
            variant="roleTitle"
            className="text-[16px] text-brand-primary"
            accessibilityLiveRegion="polite"
            style={{ opacity: refreshing && hasTotal ? 0.85 : 1 }}
          >
            {hasTotal ? formatInr(estimatedTotal) : '—'}
          </Typography>
        </View>
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
          disabled={addDisabled}
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
          className={cn(
            'h-11 flex-1 items-center justify-center rounded-lg border px-sm',
            addDisabled
              ? 'border-brand-border bg-brand-surface'
              : 'border-brand-heading bg-brand-white',
          )}
        >
          <Typography
            variant="button"
            className={cn(
              'text-[13px] tracking-normal',
              addDisabled ? 'text-brand-muted' : 'text-brand-heading',
            )}
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </Typography>
        </Pressable>

        <Pressable
          onPress={onBuyNow}
          disabled={buyDisabled}
          accessibilityRole="button"
          accessibilityLabel="Buy now"
          accessibilityState={{ busy: lockingPrice, disabled: buyDisabled }}
          className={cn(
            'h-11 flex-1 flex-row items-center justify-center rounded-lg px-sm',
            buyDisabled ? 'bg-brand-disabled' : 'bg-brand-heading',
          )}
        >
          {lockingPrice ? <ActivityIndicator size="small" color={brandColors.white} /> : null}
          <Typography
            variant="button"
            className={cn('text-[13px] tracking-normal', lockingPrice ? 'ml-xs' : 'mr-xs')}
          >
            {lockingPrice ? 'Locking price...' : 'Buy Now'}
          </Typography>
          {lockingPrice ? null : <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />}
        </Pressable>
      </View>
    </View>
  );
});

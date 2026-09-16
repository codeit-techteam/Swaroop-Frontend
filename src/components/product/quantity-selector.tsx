import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type QuantitySelectorProps = {
  quantityMt: number;
  minMt: number;
  maxMt?: number;
  increment: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
};

export const QuantitySelector = memo(function QuantitySelector({
  quantityMt,
  minMt,
  maxMt,
  increment,
  onIncrement,
  onDecrement,
  className,
}: QuantitySelectorProps) {
  const canDecrement = quantityMt - increment >= minMt;
  const canIncrement = maxMt == null || quantityMt + increment <= maxMt;

  return (
    <View
      className={cn('h-11 flex-row items-center rounded-lg bg-brand-surface px-sm', className)}
      accessibilityRole="adjustable"
      accessibilityLabel={`Quantity ${quantityMt} MT`}
      accessibilityValue={{ min: minMt, now: quantityMt, max: maxMt }}
    >
      <Pressable
        onPress={onDecrement}
        disabled={!canDecrement}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Decrease quantity by ${increment} MT`}
        className="h-8 w-8 items-center justify-center"
      >
        <Typography
          variant="roleTitle"
          className={cn('text-[18px]', canDecrement ? 'text-brand-heading' : 'text-brand-disabled')}
        >
          −
        </Typography>
      </Pressable>

      <Typography
        variant="roleTitle"
        className="min-w-[52px] text-center text-[14px] text-brand-heading"
      >
        {quantityMt} MT
      </Typography>

      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Increase quantity by ${increment} MT`}
        className="h-8 w-8 items-center justify-center"
      >
        <Typography
          variant="roleTitle"
          className={cn('text-[18px]', canIncrement ? 'text-brand-heading' : 'text-brand-disabled')}
        >
          +
        </Typography>
      </Pressable>
    </View>
  );
});

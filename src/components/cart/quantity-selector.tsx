import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type CartQuantitySelectorProps = {
  quantityMt: number;
  increment: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
};

export const CartQuantitySelector = memo(function CartQuantitySelector({
  quantityMt,
  increment,
  onIncrement,
  onDecrement,
  className,
}: CartQuantitySelectorProps) {
  const scale = useSharedValue(1);
  const canDecrement = quantityMt - increment >= 1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 90 }),
      withSpring(1, { damping: 14, stiffness: 280 }),
    );
  };

  return (
    <View
      className={cn(
        'h-10 flex-row items-center overflow-hidden rounded-lg border border-brand-border bg-brand-surface',
        className,
      )}
      accessibilityRole="adjustable"
      accessibilityLabel={`Quantity ${quantityMt} MT`}
      accessibilityValue={{ min: increment, now: quantityMt }}
    >
      <Pressable
        onPress={() => {
          if (!canDecrement) {
            return;
          }
          pulse();
          onDecrement();
        }}
        disabled={!canDecrement}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Decrease quantity by ${increment} MT`}
        className="h-full w-9 items-center justify-center bg-brand-overlay"
      >
        <Typography
          variant="roleTitle"
          className={cn(
            'text-[18px] leading-[20px]',
            canDecrement ? 'text-brand-heading' : 'text-brand-disabled',
          )}
        >
          −
        </Typography>
      </Pressable>

      <Animated.View
        className="min-w-[56px] items-center justify-center px-sm"
        style={animatedStyle}
      >
        <Typography variant="roleTitle" className="text-center text-[14px] text-brand-heading">
          {quantityMt}
        </Typography>
      </Animated.View>

      <Pressable
        onPress={() => {
          pulse();
          onIncrement();
        }}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Increase quantity by ${increment} MT`}
        className="h-full w-9 items-center justify-center bg-brand-overlay"
      >
        <Typography variant="roleTitle" className="text-[18px] leading-[20px] text-brand-heading">
          +
        </Typography>
      </Pressable>
    </View>
  );
});

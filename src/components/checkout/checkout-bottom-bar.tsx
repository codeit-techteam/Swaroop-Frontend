import { memo } from 'react';

import { Pressable } from 'react-native';

import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { ArrowRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type CheckoutBottomBarProps = {
  enabled: boolean;
  onPlaceOrder: () => void;
  className?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CheckoutBottomBar = memo(function CheckoutBottomBar({
  enabled,
  onPlaceOrder,
  className,
}: CheckoutBottomBarProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(320).springify().damping(18)}
      className={cn('border-t border-brand-border bg-brand-white px-lg pt-md', className)}
      style={[elevation.lg, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <AnimatedPressable
        onPress={onPlaceOrder}
        disabled={!enabled}
        onPressIn={() => {
          if (enabled) {
            scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 320 });
        }}
        accessibilityRole="button"
        accessibilityState={{ disabled: !enabled }}
        accessibilityLabel="Verify and place order"
        className={cn(
          'h-14 flex-row items-center justify-center rounded-xl',
          enabled ? 'bg-brand-heading' : 'bg-brand-disabled',
        )}
        style={animatedStyle}
      >
        <Typography variant="button" className="mr-xs text-[15px] tracking-normal text-brand-white">
          Verify & Place Order
        </Typography>
        <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
      </AnimatedPressable>
    </Animated.View>
  );
});

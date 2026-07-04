import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { formatCartCurrency } from '@/constants/cart';
import { ArrowRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type CheckoutBarProps = {
  totalPayable: number;
  enabled: boolean;
  onCheckout: () => void;
  className?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CheckoutBar = memo(function CheckoutBar({
  totalPayable,
  enabled,
  onCheckout,
  className,
}: CheckoutBarProps) {
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
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <View className="mr-sm">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.4px] text-brand-muted"
          >
            Total Payable
          </Typography>
          <Typography
            variant="roleTitle"
            className="text-[18px] text-brand-primary"
            accessibilityLiveRegion="polite"
          >
            {formatCartCurrency(totalPayable)}
          </Typography>
        </View>

        <AnimatedPressable
          onPress={onCheckout}
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
          accessibilityLabel="Proceed to checkout"
          className={cn(
            'h-12 flex-1 flex-row items-center justify-center rounded-xl px-md',
            enabled ? 'bg-brand-heading' : 'bg-brand-disabled',
          )}
          style={animatedStyle}
        >
          <Typography
            variant="button"
            className="mr-xs text-[14px] tracking-normal text-brand-white"
          >
            Proceed to Checkout
          </Typography>
          <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
});

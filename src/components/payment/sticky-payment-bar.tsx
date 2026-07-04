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
import { formatDiscountLabel, formatPaymentCurrency } from '@/constants/payment';
import { ArrowRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type StickyPaymentBarProps = {
  methodTitle: string;
  discount: number;
  payableAmount: number;
  onContinue: () => void;
  className?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const StickyPaymentBar = memo(function StickyPaymentBar({
  methodTitle,
  discount,
  payableAmount,
  onContinue,
  className,
}: StickyPaymentBarProps) {
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
      <View className="mb-md flex-row items-end justify-between">
        <View className="mr-sm flex-1">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.6px] text-brand-muted"
          >
            PAYMENT METHOD
          </Typography>
          <Typography
            variant="roleTitle"
            className="mt-xs text-[14px] text-brand-heading"
            numberOfLines={1}
          >
            {methodTitle}
          </Typography>
        </View>

        <View className="mr-md items-end">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.6px] text-brand-muted"
          >
            DISCOUNT
          </Typography>
          <Typography
            variant="roleTitle"
            className={cn(
              'mt-xs text-[13px]',
              discount > 0 ? 'text-brand-success' : 'text-brand-heading',
            )}
          >
            {discount > 0 ? formatDiscountLabel(discount) : '—'}
          </Typography>
        </View>

        <View className="items-end">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.6px] text-brand-muted"
          >
            PAYABLE
          </Typography>
          <Typography
            variant="roleTitle"
            className="mt-xs text-[16px] text-brand-heading"
            accessibilityLiveRegion="polite"
          >
            {formatPaymentCurrency(payableAmount)}
          </Typography>
        </View>
      </View>

      <AnimatedPressable
        onPress={onContinue}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 16, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 320 });
        }}
        accessibilityRole="button"
        accessibilityLabel="Continue to order confirmation"
        className="h-12 flex-row items-center justify-center rounded-xl bg-brand-heading"
        style={animatedStyle}
      >
        <Typography variant="button" className="mr-xs text-[15px] tracking-normal">
          Continue
        </Typography>
        <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
      </AnimatedPressable>
    </Animated.View>
  );
});

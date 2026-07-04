import { memo, useEffect } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { PaymentComparisonOption } from '@/types/payment';
import { cn } from '@/utils/cn';

type PaymentComparisonRowProps = {
  option: PaymentComparisonOption;
  selected: boolean;
  isLast?: boolean;
  onSelect: (id: PaymentComparisonOption['id']) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const COLUMN_WIDTHS = {
  method: 118,
  discount: 56,
  timeline: 72,
  interest: 52,
  eligibility: 68,
} as const;

export const PaymentComparisonRow = memo(function PaymentComparisonRow({
  option,
  selected,
  isLast = false,
  onSelect,
}: PaymentComparisonRowProps) {
  const scale = useSharedValue(1);
  const selectedProgress = useSharedValue(selected ? 1 : 0);
  const recommendedProgress = useSharedValue(option.recommended ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected, selectedProgress]);

  useEffect(() => {
    recommendedProgress.value = withTiming(option.recommended ? 1 : 0, { duration: 200 });
  }, [option.recommended, recommendedProgress]);

  const containerStyle = useAnimatedStyle(() => {
    const baseTint = recommendedProgress.value * 0.55;
    const selectedTint = selectedProgress.value;
    const tint = Math.max(baseTint, selectedTint);

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(
        tint,
        [0, 0.55, 1],
        [brandColors.white, brandColors.primaryTint, brandColors.primaryLight],
      ),
    };
  });

  const checkStyle = useAnimatedStyle(() => ({
    opacity: selectedProgress.value,
    transform: [{ scale: selectedProgress.value }],
  }));

  const hasPositiveDiscount = option.discount !== '0%';
  const hasInterest = option.interest !== '0%';

  return (
    <AnimatedPressable
      onPress={() => onSelect(option.id)}
      onPressIn={() => {
        scale.value = withSpring(0.985, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${option.title}, ${option.subtitle}`}
      className={cn('flex-row items-center px-3 py-3', !isLast && 'border-b border-brand-border')}
      style={containerStyle}
    >
      <View style={{ width: COLUMN_WIDTHS.method }} className="pr-2">
        <View className="relative pr-4">
          <View className="flex-row flex-wrap items-center">
            <Typography
              variant="roleTitle"
              className="text-[11px] leading-[15px] text-brand-heading"
              numberOfLines={2}
            >
              {option.title}
            </Typography>
            {option.recommended ? (
              <View className="ml-1 mt-0.5 rounded-full bg-brand-heading px-1.5 py-0.5">
                <Typography
                  variant="badge"
                  className="text-[7px] tracking-[0.3px] text-brand-white"
                >
                  BEST VALUE
                </Typography>
              </View>
            ) : null}
          </View>
          <Typography
            variant="roleDescription"
            className="mt-0.5 text-[10px] leading-[14px] text-brand-muted"
          >
            {option.subtitle}
          </Typography>

          <Animated.View style={checkStyle} className="absolute right-0 top-0">
            <CheckCircleIcon size={iconSizes.sm} color={brandColors.heading} />
          </Animated.View>
        </View>
      </View>

      <View style={{ width: COLUMN_WIDTHS.discount }} className="items-center px-0.5">
        <Typography
          variant="roleTitle"
          className={cn(
            'text-[11px]',
            hasPositiveDiscount ? 'text-brand-success' : 'text-brand-body',
          )}
        >
          {option.discount}
        </Typography>
      </View>

      <View style={{ width: COLUMN_WIDTHS.timeline }} className="items-center px-0.5">
        <Typography
          variant="roleDescription"
          className="text-center text-[10px] leading-[13px] text-brand-body"
          numberOfLines={2}
        >
          {option.timeline}
        </Typography>
      </View>

      <View style={{ width: COLUMN_WIDTHS.interest }} className="items-center px-0.5">
        <Typography
          variant="roleTitle"
          className={cn('text-[11px]', hasInterest ? 'text-brand-error' : 'text-brand-body')}
        >
          {option.interest}
        </Typography>
      </View>

      <View style={{ width: COLUMN_WIDTHS.eligibility }} className="items-center px-0.5">
        <View className="rounded-md bg-brand-overlay px-1.5 py-1">
          <Typography
            variant="badge"
            className="text-center text-[8px] tracking-[0.2px] text-brand-body"
            numberOfLines={1}
          >
            {option.eligibility}
          </Typography>
        </View>
      </View>
    </AnimatedPressable>
  );
});

export const PAYMENT_COMPARISON_TABLE_MIN_WIDTH =
  COLUMN_WIDTHS.method +
  COLUMN_WIDTHS.discount +
  COLUMN_WIDTHS.timeline +
  COLUMN_WIDTHS.interest +
  COLUMN_WIDTHS.eligibility +
  24;

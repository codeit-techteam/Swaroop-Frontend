import { memo, useEffect } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { formatPaymentCurrency, formatSavingsLabel } from '@/constants/payment';
import { CurrencyIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import type { PaymentBadgeVariant, PaymentMethod } from '@/types/payment';
import { cn } from '@/utils/cn';

type PaymentMethodCardProps = {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (methodId: PaymentMethod['id']) => void;
};

const BADGE_STYLES: Record<PaymentBadgeVariant, { container: string; text: string }> = {
  recommended: {
    container: 'bg-brand-primary-light',
    text: 'text-brand-badge-text',
  },
  eligible: {
    container: 'bg-brand-overlay',
    text: 'text-brand-body',
  },
  credit: {
    container: 'bg-brand-primary-light',
    text: 'text-brand-badge-text',
  },
  premium: {
    container: 'bg-[#FFF4E5]',
    text: 'text-[#C2410C]',
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PaymentMethodCard = memo(function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  const selectedProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, selectedProgress]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [brandColors.border, brandColors.heading],
    ),
    backgroundColor: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [brandColors.white, brandColors.primaryTint],
    ),
  }));

  const radioStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [brandColors.indicatorInactive, brandColors.heading],
    ),
  }));

  const radioDotStyle = useAnimatedStyle(() => ({
    opacity: selectedProgress.value,
    transform: [{ scale: selectedProgress.value }],
  }));

  const badgeStyle = method.badge ? BADGE_STYLES[method.badge.variant] : null;

  return (
    <AnimatedPressable
      onPress={() => onSelect(method.id)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={method.title}
      className="rounded-2xl border px-md py-md"
      style={[elevation.sm, containerStyle]}
    >
      <View className="flex-row items-start">
        <Animated.View
          className="mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2"
          style={radioStyle}
        >
          <Animated.View
            className="h-2.5 w-2.5 rounded-full bg-brand-heading"
            style={radioDotStyle}
          />
        </Animated.View>

        <View className="ml-md flex-1">
          <View className="flex-row items-start justify-between">
            <Typography variant="roleTitle" className="mr-sm flex-1 text-[15px] text-brand-heading">
              {method.title}
            </Typography>

            {method.badge && badgeStyle ? (
              <View className={cn('rounded-full px-sm py-xs', badgeStyle.container)}>
                <Typography
                  variant="badge"
                  className={cn('text-[9px] tracking-[0.5px]', badgeStyle.text)}
                >
                  {method.badge.label}
                </Typography>
              </View>
            ) : null}
          </View>

          {method.description ? (
            <Typography
              variant="roleDescription"
              className="mt-xs text-[12px] leading-[18px] text-brand-body"
            >
              {method.description}
            </Typography>
          ) : null}

          {method.discount > 0 ? (
            <View className="mt-sm flex-row items-center">
              <CurrencyIcon size={iconSizes.sm} color={brandColors.success} />
              <Typography variant="success" className="ml-xs font-semibold text-[12px]">
                {formatSavingsLabel(method.discount)}
              </Typography>
            </View>
          ) : null}

          {method.hasCredit ? (
            <View className="mt-sm flex-row items-end justify-between">
              <View className="flex-1 pr-sm">
                <Typography
                  variant="fieldLabel"
                  className="text-[10px] tracking-[0.6px] text-brand-muted"
                >
                  LIMIT {formatPaymentCurrency(method.creditLimit ?? 0)}
                </Typography>
                <Typography
                  variant="fieldLabel"
                  className="mt-xs text-[10px] tracking-[0.6px] text-brand-muted"
                >
                  AVAILABLE {formatPaymentCurrency(method.availableCredit ?? 0)}
                </Typography>
              </View>
              <Typography
                variant="fieldLabel"
                className="text-[10px] tracking-[0.6px] text-brand-body"
              >
                INTEREST: {method.interestRate}%
              </Typography>
            </View>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
});

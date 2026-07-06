import { memo } from 'react';

import Animated, { FadeIn } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { formatCheckoutCurrency } from '@/constants/checkout';

type AnimatedCurrencyProps = {
  amount: number;
  textClassName?: string;
};

export const AnimatedCurrency = memo(function AnimatedCurrency({
  amount,
  textClassName,
}: AnimatedCurrencyProps) {
  return (
    <Animated.View key={amount} entering={FadeIn.duration(220)}>
      <Typography
        variant="roleTitle"
        className={textClassName}
        accessibilityLiveRegion="polite"
      >
        {formatCheckoutCurrency(amount)}
      </Typography>
    </Animated.View>
  );
});

type AnimatedFadeAmountProps = {
  amount: number;
  children: (formatted: string) => React.ReactNode;
};

export const AnimatedFadeAmount = memo(function AnimatedFadeAmount({
  amount,
  children,
}: AnimatedFadeAmountProps) {
  return (
    <Animated.View key={amount} entering={FadeIn.duration(220)}>
      {children(formatCheckoutCurrency(amount))}
    </Animated.View>
  );
});

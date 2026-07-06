import { memo } from 'react';

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
    <Typography
      variant="roleTitle"
      className={textClassName}
      accessibilityLiveRegion="polite"
    >
      {formatCheckoutCurrency(amount)}
    </Typography>
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
  return <>{children(formatCheckoutCurrency(amount))}</>;
});

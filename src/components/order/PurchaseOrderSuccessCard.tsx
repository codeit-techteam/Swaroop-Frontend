import { memo, useEffect } from 'react';

import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { PURCHASE_ORDER_COPY } from '@/constants/purchaseOrderTimeline';
import { PurchaseOrderIllustration } from '@/icons/purchase-order-illustration';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type PurchaseOrderSuccessCardProps = {
  className?: string;
};

export const PurchaseOrderSuccessCard = memo(function PurchaseOrderSuccessCard({
  className,
}: PurchaseOrderSuccessCardProps) {
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    badgeOpacity.value = withTiming(1, { duration: 600 });
  }, [badgeOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      className={cn(
        'items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-xl',
        className,
      )}
      style={elevation.sm}
    >
      <PurchaseOrderIllustration width={200} height={150} />

      <Animated.View
        style={badgeStyle}
        className="mt-md flex-row items-center rounded-full bg-brand-success-light px-md py-xs"
      >
        <Typography
          variant="badge"
          className="text-[11px] tracking-[0.8px] text-brand-success"
        >
          {PURCHASE_ORDER_COPY.confirmedBadge}
        </Typography>
      </Animated.View>

      <Typography
        variant="headingLeft"
        className="mt-md text-center text-[22px] text-brand-heading"
      >
        {PURCHASE_ORDER_COPY.successTitle}
      </Typography>

      <Typography
        variant="subheadingLeft"
        className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
      >
        {PURCHASE_ORDER_COPY.successSubtitle}
      </Typography>
    </Animated.View>
  );
});

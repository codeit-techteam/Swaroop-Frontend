import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { DELIVERY_COMPLETED_COPY } from '@/constants/deliveryCompleted';
import { CheckCircleIcon } from '@/icons';
import { DeliverySuccessIllustration } from '@/icons/delivery-success-illustration';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DeliverySuccessHeroCardProps = {
  className?: string;
};

export const DeliverySuccessHeroCard = memo(function DeliverySuccessHeroCard({
  className,
}: DeliverySuccessHeroCardProps) {
  const badgeScale = useSharedValue(0.85);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    badgeScale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.2)) });
    badgeOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) });
  }, [badgeOpacity, badgeScale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
  }));

  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="items-center">
        <DeliverySuccessIllustration width={220} height={160} />

        <Animated.View
          style={badgeStyle}
          className="mt-md flex-row items-center gap-xs rounded-full bg-brand-success-light px-md py-sm"
        >
          <CheckCircleIcon size={iconSizes.sm} color={brandColors.success} />
          <Typography variant="badge" className="text-[11px] text-brand-success">
            {DELIVERY_COMPLETED_COPY.deliveredBadge}
          </Typography>
        </Animated.View>

        <Typography
          variant="headingLeft"
          className="mt-lg text-center text-[20px] text-brand-heading"
        >
          {DELIVERY_COMPLETED_COPY.successTitle}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
        >
          {DELIVERY_COMPLETED_COPY.successSubtitle}
        </Typography>
      </View>
    </View>
  );
});

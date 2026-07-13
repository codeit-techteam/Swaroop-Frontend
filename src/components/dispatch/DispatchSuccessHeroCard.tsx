import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { DISPATCH_STARTED_COPY } from '@/constants/dispatchStarted';
import { CheckCircleIcon } from '@/icons';
import { DispatchTruckIllustration } from '@/icons/dispatch-truck-illustration';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DispatchSuccessHeroCardProps = {
  className?: string;
};

export const DispatchSuccessHeroCard = memo(function DispatchSuccessHeroCard({
  className,
}: DispatchSuccessHeroCardProps) {
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
        <DispatchTruckIllustration width={220} height={160} />

        <Animated.View
          style={badgeStyle}
          className="mt-md flex-row items-center gap-xs rounded-full bg-brand-success-light px-md py-sm"
        >
          <CheckCircleIcon size={iconSizes.sm} color={brandColors.success} />
          <Typography variant="badge" className="text-[11px] text-brand-success">
            {DISPATCH_STARTED_COPY.inTransitBadge}
          </Typography>
        </Animated.View>

        <Typography
          variant="headingLeft"
          className="mt-lg text-center text-[20px] text-brand-heading"
        >
          {DISPATCH_STARTED_COPY.successTitle}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
        >
          {DISPATCH_STARTED_COPY.successSubtitle}
        </Typography>
      </View>
    </View>
  );
});

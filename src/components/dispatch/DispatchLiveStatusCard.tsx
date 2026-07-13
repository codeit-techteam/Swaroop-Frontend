import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { DISPATCH_STARTED_COPY, DISPATCH_STARTED_PROGRESS } from '@/constants/dispatchStarted';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DispatchLiveStatusCardProps = {
  dispatchTime: string;
  progress?: number;
  className?: string;
};

export const DispatchLiveStatusCard = memo(function DispatchLiveStatusCard({
  dispatchTime,
  progress = DISPATCH_STARTED_PROGRESS,
  className,
}: DispatchLiveStatusCardProps) {
  const animatedWidth = useSharedValue(0);
  const hasAnimated = useSharedValue(false);

  useEffect(() => {
    if (hasAnimated.value) {
      return;
    }

    hasAnimated.value = true;
    animatedWidth.value = withTiming(progress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedWidth, hasAnimated, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography
        variant="fieldLabel"
        className="mb-md text-[10px] tracking-[0.8px] text-brand-primary"
      >
        {DISPATCH_STARTED_COPY.liveStatusHeading}
      </Typography>

      <View className="flex-row items-center justify-between">
        <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
          {DISPATCH_STARTED_COPY.currentStatus}
        </Typography>
        <View className="rounded-full bg-brand-success-light px-sm py-xs">
          <Typography variant="badge" className="text-[10px] text-brand-success">
            {DISPATCH_STARTED_COPY.inTransitBadge}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row justify-between">
        <View>
          <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
            {DISPATCH_STARTED_COPY.dispatchTimeLabel}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[13px] text-brand-heading">
            {dispatchTime}
          </Typography>
        </View>
        <View className="items-end">
          <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
            {DISPATCH_STARTED_COPY.estimatedDeliveryLabel}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[13px] text-brand-heading">
            {DISPATCH_STARTED_COPY.estimatedDelivery}
          </Typography>
        </View>
      </View>

      <View className="mt-lg">
        <View className="mb-sm flex-row items-center justify-between">
          <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
            {DISPATCH_STARTED_COPY.currentProgressLabel}
          </Typography>
          <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
            {progress}%
          </Typography>
        </View>
        <View className="h-2 w-full overflow-hidden rounded-full bg-brand-primary-tint">
          <Animated.View
            className="h-full rounded-full bg-brand-primary"
            style={progressStyle}
          />
        </View>
      </View>
    </View>
  );
});

import { memo, useCallback, useEffect, useState } from 'react';

import { type LayoutChangeEvent, View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ProcurementState } from '@/types/procurement';
import { cn } from '@/utils/cn';

type ProcurementProgressCardProps = {
  procurement: ProcurementState;
  statusLabel: string;
  className?: string;
};

export const ProcurementProgressCard = memo(function ProcurementProgressCard({
  procurement,
  statusLabel,
  className,
}: ProcurementProgressCardProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progressWidth = useSharedValue(0);

  const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    if (trackWidth === 0) {
      return;
    }

    progressWidth.value = withTiming((procurement.progress / 100) * trackWidth, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [procurement.progress, progressWidth, trackWidth]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  return (
    <View
      className={cn(
        'w-full rounded-2xl border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="bg-brand-badge-bg rounded-full px-md py-xs">
          <Typography variant="roleTitle" className="text-[12px] text-brand-badge-text">
            {statusLabel}
          </Typography>
        </View>
        <Typography variant="roleTitle" className="text-[18px] text-brand-heading">
          {procurement.progress}%
        </Typography>
      </View>

      <View
        className="mt-md h-2.5 overflow-hidden rounded-full bg-brand-primary-light"
        onLayout={handleTrackLayout}
      >
        <Animated.View className="h-full rounded-full bg-brand-primary" style={animatedBarStyle} />
      </View>

      <View className="mt-md flex-row items-center">
        <ClockIcon size={iconSizes.sm} color={brandColors.body} />
        <Typography variant="roleDescription" className="ml-xs text-[13px] text-brand-body">
          {PROCUREMENT_SCREEN_COPY.estimatedTimePrefix} {procurement.estimatedTime}
        </Typography>
      </View>
    </View>
  );
});

import { memo, useCallback, useEffect, useState } from 'react';

import { type LayoutChangeEvent, View } from 'react-native';

import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
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
    <Animated.View
      entering={FadeInDown.duration(400)}
      className={cn(
        'w-full rounded-2xl border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
      style={elevation.sm}
    >
      <View className="flex-row items-center justify-between">
        <View className="rounded-full bg-brand-badge-bg px-md py-xs">
          <Typography variant="roleTitle" className="text-[12px] text-brand-badge-text">
            {statusLabel}
          </Typography>
        </View>
        <View className="items-end">
          <Typography variant="roleTitle" className="text-[22px] text-brand-heading">
            {procurement.progress}%
          </Typography>
          <Typography variant="fieldLabel" className="text-[10px] tracking-[0.6px] text-brand-muted">
            COMPLETE
          </Typography>
        </View>
      </View>

      <View
        className="mt-md h-3 overflow-hidden rounded-full bg-brand-primary-light"
        onLayout={handleTrackLayout}
      >
        <Animated.View className="h-full rounded-full bg-brand-primary" style={animatedBarStyle} />
      </View>

      <View className="mt-md flex-row items-center justify-between">
        <View className="flex-row items-center">
          <ClockIcon size={iconSizes.sm} color={brandColors.body} />
          <Typography variant="roleDescription" className="ml-xs text-[13px] text-brand-body">
            {PROCUREMENT_SCREEN_COPY.estimatedTimePrefix} {procurement.estimatedTime}
          </Typography>
        </View>
        <Typography variant="caption" className="text-[11px] normal-case text-brand-muted">
          Updating live
        </Typography>
      </View>
    </Animated.View>
  );
});

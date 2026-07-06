import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import type { TrackingTimelineItem as TrackingTimelineItemData } from '@/types/tracking';
import { cn } from '@/utils/cn';

type TrackingTimelineItemProps = {
  item: TrackingTimelineItemData;
  isLast: boolean;
  index: number;
};

const CompletedCheckIcon = memo(function CompletedCheckIcon() {
  return (
    <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-success">
      <Typography variant="badge" className="text-[12px] text-brand-white">
        ✓
      </Typography>
    </View>
  );
});

const TimelinePulseDot = memo(function TimelinePulseDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0.15, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="h-7 w-7 items-center justify-center">
      <Animated.View
        className="absolute h-7 w-7 rounded-full bg-brand-primary"
        style={pulseStyle}
      />
      <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-brand-heading bg-brand-white" />
    </View>
  );
});

const TimelineIndicator = memo(function TimelineIndicator({
  status,
}: {
  status: TrackingTimelineItemData['status'];
}) {
  if (status === 'completed') {
    return <CompletedCheckIcon />;
  }

  if (status === 'current') {
    return <TimelinePulseDot />;
  }

  return (
    <View className="h-7 w-7 items-center justify-center rounded-full border border-brand-border bg-brand-white" />
  );
});

const TimelineConnector = memo(function TimelineConnector({
  status,
}: {
  status: TrackingTimelineItemData['status'];
}) {
  const isCompleted = status === 'completed';

  return (
    <View
      className={cn('my-xs min-h-[28px] w-0.5 flex-1', isCompleted ? 'bg-brand-success' : 'bg-brand-border')}
    />
  );
});

export const TrackingTimelineItem = memo(function TrackingTimelineItem({
  item,
  isLast,
  index,
}: TrackingTimelineItemProps) {
  const isPending = item.status === 'pending';
  const isCurrent = item.status === 'current';

  return (
    <Animated.View entering={FadeIn.duration(300).delay(index * 40)} className="flex-row">
      <View className="mr-md items-center">
        <TimelineIndicator status={item.status} />
        {!isLast ? <TimelineConnector status={item.status} /> : null}
      </View>

      <View className={cn('min-w-0 flex-1', !isLast && 'pb-lg')}>
        <Typography
          variant="roleTitle"
          className={cn(
            'text-[14px]',
            isPending ? 'text-brand-muted' : isCurrent ? 'text-brand-heading' : 'text-brand-heading',
          )}
        >
          {item.title}
        </Typography>
        <Typography
          variant="subheadingLeft"
          className={cn(
            'mt-xs text-[12px]',
            isPending ? 'text-brand-muted' : 'text-brand-body',
          )}
        >
          {item.date}
          {item.time ? ` • ${item.time}` : ''}
        </Typography>
        {isCurrent ? (
          <Typography variant="roleDescription" className="mt-xs text-[12px] font-semibold text-brand-primary">
            {item.statusLabel}
          </Typography>
        ) : null}
      </View>
    </Animated.View>
  );
});

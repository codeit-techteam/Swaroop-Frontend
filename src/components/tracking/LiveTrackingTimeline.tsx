import { memo } from 'react';

import { View } from 'react-native';

import { TrackingTimelineItem } from '@/components/tracking/TrackingTimelineItem';
import type { TrackingTimelineItem as TrackingTimelineItemType } from '@/types/tracking';
import { cn } from '@/utils/cn';

type LiveTrackingTimelineProps = {
  items: TrackingTimelineItemType[];
  className?: string;
};

export const LiveTrackingTimeline = memo(function LiveTrackingTimeline({
  items,
  className,
}: LiveTrackingTimelineProps) {
  return (
    <View className={cn('w-full', className)}>
      {items.map((item, index) => (
        <TrackingTimelineItem
          key={item.id}
          item={item}
          index={index}
          isLast={index === items.length - 1}
        />
      ))}
    </View>
  );
});

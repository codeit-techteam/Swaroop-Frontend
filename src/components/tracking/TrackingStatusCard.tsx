import { memo } from 'react';

import { View } from 'react-native';

import { LiveTrackingTimeline } from '@/components/tracking/LiveTrackingTimeline';
import { Typography } from '@/components/ui/typography';
import { TRACKING_COPY } from '@/constants/trackingTimeline';
import type { TrackingTimelineItem } from '@/types/tracking';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type TrackingStatusCardProps = {
  items: TrackingTimelineItem[];
  className?: string;
};

export const TrackingStatusCard = memo(function TrackingStatusCard({
  items,
  className,
}: TrackingStatusCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography
        variant="fieldLabel"
        className="mb-lg text-[10px] tracking-[0.8px] text-brand-muted"
      >
        {TRACKING_COPY.liveTrackingHeading}
      </Typography>
      <LiveTrackingTimeline items={items} />
    </View>
  );
});

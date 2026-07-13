import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DISPATCH_STARTED_COPY } from '@/constants/dispatchStarted';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { DispatchTrackingTimelineItem } from '@/types/tracking';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DispatchTimelineCardProps = {
  steps: DispatchTrackingTimelineItem[];
  className?: string;
};

const TimelineIndicator = memo(function TimelineIndicator({
  status,
}: {
  status: DispatchTrackingTimelineItem['status'];
}) {
  if (status === 'completed') {
    return <CheckCircleIcon size={iconSizes.lg} color={brandColors.success} />;
  }

  if (status === 'current') {
    return (
      <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-primary">
        <View className="h-2.5 w-2.5 rounded-full bg-brand-white" />
      </View>
    );
  }

  return (
    <View className="h-7 w-7 items-center justify-center rounded-full border-2 border-brand-border bg-brand-white">
      <View className="h-2 w-2 rounded-full bg-brand-muted" />
    </View>
  );
});

const TimelineConnector = memo(function TimelineConnector({ active }: { active: boolean }) {
  return (
    <View
      className={cn('my-xs min-h-[24px] w-0.5 flex-1', active ? 'bg-brand-success' : 'bg-brand-border')}
    />
  );
});

export const DispatchTimelineCard = memo(function DispatchTimelineCard({
  steps,
  className,
}: DispatchTimelineCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography variant="roleTitle" className="mb-lg text-[15px] text-brand-heading">
        {DISPATCH_STARTED_COPY.timelineHeading}
      </Typography>

      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const connectorActive = step.status === 'completed';

        return (
          <View key={step.id} className="flex-row">
            <View className="mr-md items-center">
              <TimelineIndicator status={step.status} />
              {!isLast ? <TimelineConnector active={connectorActive} /> : null}
            </View>

            <View className={cn('min-w-0 flex-1', !isLast && 'pb-lg')}>
              <Typography
                variant="roleTitle"
                className={cn(
                  'text-[14px]',
                  step.status === 'pending' ? 'text-brand-muted' : 'text-brand-heading',
                )}
              >
                {step.status === 'completed' ? `✔ ${step.title}` : step.title}
              </Typography>
              {step.status === 'current' ? (
                <Typography
                  variant="roleDescription"
                  className="mt-xs text-[11px] font-bold tracking-[0.5px] text-brand-primary"
                >
                  IN PROGRESS
                </Typography>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
});

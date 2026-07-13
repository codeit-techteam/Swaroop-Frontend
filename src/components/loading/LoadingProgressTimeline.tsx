import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { LoadingProgressStep } from '@/types/loading';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type LoadingProgressTimelineProps = {
  steps: LoadingProgressStep[];
  heading?: string;
  className?: string;
};

const TimelineIndicator = memo(function TimelineIndicator({
  status,
}: {
  status: LoadingProgressStep['status'];
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

export const LoadingProgressTimeline = memo(function LoadingProgressTimeline({
  steps,
  heading,
  className,
}: LoadingProgressTimelineProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      {heading ? (
        <Typography variant="roleTitle" className="mb-lg text-[15px] text-brand-heading">
          {heading}
        </Typography>
      ) : null}

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
              {step.subtitle ? (
                <Typography
                  variant="roleDescription"
                  className={cn(
                    'mt-xs text-[12px]',
                    step.status === 'current'
                      ? 'font-semibold text-brand-primary'
                      : 'text-brand-body',
                  )}
                >
                  {step.subtitle}
                </Typography>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
});

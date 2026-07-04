import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { HourglassIcon, InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { TimelineStep } from '@/types/document';
import { cn } from '@/utils/cn';

type TimelineCardProps = {
  steps: TimelineStep[];
  className?: string;
};

export const TimelineCard = memo(function TimelineCard({ steps, className }: TimelineCardProps) {
  return (
    <View
      className={cn(
        'w-full rounded-lg border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
    >
      <Typography variant="fieldLabel" className="mb-lg">
        Next Steps
      </Typography>

      {steps.map((step, index) => {
        const isActive = step.status === 'in_progress' || step.status === 'completed';
        const isLast = index === steps.length - 1;

        return (
          <View key={step.id} className="flex-row">
            <View className="mr-md items-center">
              {step.status === 'in_progress' ? (
                <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-primary-light">
                  <HourglassIcon />
                </View>
              ) : (
                <View
                  className={cn(
                    'h-9 w-9 items-center justify-center rounded-full border-2',
                    isActive
                      ? 'border-brand-primary bg-brand-primary'
                      : 'border-brand-indicator bg-brand-white',
                  )}
                />
              )}
              {!isLast ? (
                <View
                  className={cn(
                    'my-xs min-h-[28px] w-0.5 flex-1',
                    isActive ? 'bg-brand-primary-light' : 'bg-brand-border',
                  )}
                />
              ) : null}
            </View>

            <View className={cn('flex-1', !isLast && 'pb-lg')}>
              <Typography
                variant="roleTitle"
                className={isActive ? 'text-brand-primary' : 'text-brand-muted'}
              >
                {step.title}
              </Typography>
              {step.meta ? (
                <Typography variant="roleDescription" className="mt-xs text-brand-primary">
                  {step.meta}
                </Typography>
              ) : null}
              <View className="mt-sm flex-row items-start gap-xs">
                {step.status === 'in_progress' ? <InfoIcon color={brandColors.primary} /> : null}
                <Typography
                  variant="legal"
                  className={cn(
                    'flex-1 text-left',
                    isActive ? 'text-brand-body' : 'text-brand-muted',
                  )}
                >
                  {step.description}
                </Typography>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
});

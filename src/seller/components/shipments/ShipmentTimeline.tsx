import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

import type { ShipmentTimelineStep } from '@/seller/types/shipments';

type ShipmentTimelineProps = {
  steps: ShipmentTimelineStep[];
};

export const ShipmentTimeline = memo(function ShipmentTimeline({ steps }: ShipmentTimelineProps) {
  return (
    <View>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';

        return (
          <View key={step.id} className="flex-row">
            <View className="mr-md items-center">
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full border-2',
                  isCompleted
                    ? 'border-brand-success bg-brand-success-light'
                    : isCurrent
                      ? 'border-brand-navy bg-brand-navy'
                      : 'border-brand-border bg-brand-white',
                )}
              >
                {isCompleted ? (
                  <CheckCircleIcon size={14} color={brandColors.success} />
                ) : (
                  <View
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      isCurrent ? 'bg-brand-white' : 'bg-brand-border',
                    )}
                  />
                )}
              </View>
              {!isLast ? <View className="my-1 w-0.5 flex-1 bg-brand-border" /> : null}
            </View>

            <View className={cn('flex-1 pb-lg', isLast && 'pb-0')}>
              <Typography
                variant="roleTitle"
                className={cn(
                  'text-[15px]',
                  isCurrent ? 'text-brand-heading' : isCompleted ? 'text-brand-body' : 'text-brand-footer',
                )}
              >
                {step.label}
              </Typography>
              {step.timestamp ? (
                <Typography variant="legal" className="mt-0.5 text-left text-brand-body">
                  {step.timestamp}
                </Typography>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
});

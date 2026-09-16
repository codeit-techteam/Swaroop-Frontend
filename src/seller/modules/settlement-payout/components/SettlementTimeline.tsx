import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';
import { getTimelineSteps } from '@/seller/modules/settlement-payout/services/settlementService';
import type { SettlementTimelineStep } from '@/seller/modules/settlement-payout/types/settlement';

export const SettlementTimeline = memo(function SettlementTimeline({
  currentStep,
}: {
  currentStep: SettlementTimelineStep;
}) {
  const steps = getTimelineSteps(currentStep);

  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white p-lg">
      <Typography variant="headingLeft" className="text-[18px]">
        Timeline
      </Typography>
      <View className="mt-lg">
        {steps.map((step, index) => (
          <View key={step.id} className="flex-row">
            <View className="mr-md items-center">
              <View
                className={cn(
                  'h-3 w-3 rounded-full',
                  step.state === 'complete'
                    ? 'bg-brand-success'
                    : step.state === 'current'
                      ? 'bg-brand-primary'
                      : 'bg-brand-border',
                )}
              />
              {index < steps.length - 1 ? (
                <View
                  className={cn(
                    'mt-xs w-px flex-1 min-h-[36px]',
                    step.state === 'complete' ? 'bg-brand-success/40' : 'bg-brand-border',
                  )}
                />
              ) : null}
            </View>
            <View className={cn('flex-1', index < steps.length - 1 && 'pb-md')}>
              <Typography
                variant="roleTitle"
                className={cn(
                  step.state === 'current' && 'text-brand-primary',
                  step.state === 'upcoming' && 'text-brand-body',
                )}
              >
                {step.label}
              </Typography>
              {step.state === 'current' ? (
                <Typography variant="legal" className="mt-xs text-left text-brand-primary">
                  Current step
                </Typography>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

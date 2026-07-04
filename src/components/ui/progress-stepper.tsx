import { Fragment, memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { StepperStep } from '@/types/document';
import { cn } from '@/utils/cn';

type ProgressStepperProps = {
  steps: StepperStep[];
  className?: string;
};

export const ProgressStepper = memo(function ProgressStepper({
  steps,
  className,
}: ProgressStepperProps) {
  return (
    <View className={cn('w-full', className)}>
      <View className="flex-row items-center px-md">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isActive = isCompleted || isCurrent;
          const nextStep = steps[index + 1];
          const lineActive = isCompleted && nextStep != null && nextStep.status !== 'upcoming';

          return (
            <Fragment key={step.id}>
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full',
                  isActive ? 'bg-brand-primary' : 'bg-brand-indicator',
                )}
              >
                {isCompleted ? (
                  <Typography variant="button" className="text-[12px]">
                    ✓
                  </Typography>
                ) : (
                  <Typography variant="button" className="text-[12px]">
                    {index + 1}
                  </Typography>
                )}
              </View>

              {index < steps.length - 1 ? (
                <View
                  className={cn(
                    'mx-xs h-0.5 flex-1',
                    lineActive ? 'bg-brand-primary' : 'bg-brand-indicator',
                  )}
                />
              ) : null}
            </Fragment>
          );
        })}
      </View>

      <View className="mt-sm flex-row justify-between px-xs">
        {steps.map((step) => {
          const isActive = step.status === 'completed' || step.status === 'current';
          return (
            <Typography
              key={`${step.id}-label`}
              variant="legal"
              className={cn(
                'w-1/3 text-center',
                isActive ? 'font-medium text-brand-primary' : 'text-brand-muted',
              )}
            >
              {step.label}
            </Typography>
          );
        })}
      </View>
    </View>
  );
});

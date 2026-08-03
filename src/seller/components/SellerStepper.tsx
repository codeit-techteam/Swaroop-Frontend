import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { SELLER_STEPPER_LABELS } from '@/seller/constants';
import type { SellerStepId } from '@/seller/types';
import { cn } from '@/utils/cn';

type SellerStepperProps = {
  currentStep: SellerStepId;
  className?: string;
};

const ORDER: SellerStepId[] = ['company', 'verification', 'review'];

export const SellerStepper = memo(function SellerStepper({
  currentStep,
  className,
}: SellerStepperProps) {
  const currentIndex = ORDER.indexOf(currentStep);

  return (
    <View className={cn('rounded-2xl bg-brand-white px-lg py-lg shadow-sm', className)}>
      <View className="flex-row items-center">
        {ORDER.map((step, index) => {
          const active = index <= currentIndex;
          const completed = index < currentIndex;
          return (
            <View key={step} className="flex-1">
              <View className="flex-row items-center">
                <View
                  className={cn(
                    'h-7 w-7 items-center justify-center rounded-full',
                    active ? 'bg-brand-navy' : 'bg-brand-border',
                  )}
                >
                  <Typography variant="button" className="text-[11px]">
                    {completed ? '✓' : index + 1}
                  </Typography>
                </View>
                {index < ORDER.length - 1 ? (
                  <View
                    className={cn(
                      'mx-sm h-[2px] flex-1',
                      index < currentIndex ? 'bg-brand-navy' : 'bg-brand-border',
                    )}
                  />
                ) : null}
              </View>
              <Typography
                variant="legal"
                className={cn(
                  'mt-sm text-left',
                  active ? 'font-semibold text-brand-heading' : 'text-brand-muted',
                )}
              >
                {SELLER_STEPPER_LABELS[step]}
              </Typography>
            </View>
          );
        })}
      </View>
    </View>
  );
});

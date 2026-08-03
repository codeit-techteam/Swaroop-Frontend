import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { CheckCircleIcon, ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

export type TimelineStep = {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
};

export const Timeline = memo(function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((step, index) => (
        <View key={step.id} className="flex-row">
          <View className="mr-md items-center">
            <View
              className={cn(
                'h-8 w-8 items-center justify-center rounded-full',
                step.status === 'completed'
                  ? 'bg-brand-primary-light'
                  : step.status === 'current'
                    ? 'bg-[#E8F1F8]'
                    : 'bg-brand-surface',
              )}
            >
              {step.status === 'pending' ? (
                <ClockIcon size={14} color={brandColors.body} />
              ) : (
                <CheckCircleIcon
                  size={14}
                  color={step.status === 'current' ? '#0B4A8B' : brandColors.navy}
                />
              )}
            </View>
            {index < steps.length - 1 ? (
              <View className="my-xs w-0.5 flex-1 bg-brand-border" />
            ) : null}
          </View>
          <View className={cn('mb-lg flex-1', index === steps.length - 1 && 'mb-0')}>
            <Typography variant="roleTitle">{step.label}</Typography>
            {step.timestamp ? (
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                {step.timestamp}
              </Typography>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
});

export const AnalyticsSkeleton = memo(function AnalyticsSkeleton() {
  return (
    <View className="gap-md">
      <View className="flex-row gap-md">
        <View className="h-[88px] flex-1 rounded-2xl bg-brand-surface" />
        <View className="h-[88px] flex-1 rounded-2xl bg-brand-surface" />
      </View>
      <View className="h-[220px] rounded-2xl bg-brand-surface" />
      <View className="h-[160px] rounded-2xl bg-brand-surface" />
    </View>
  );
});

export const AnalyticsErrorState = memo(function AnalyticsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View className="items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-2xl">
      <Typography variant="roleTitle" className="text-center">
        Unable to load analytics
      </Typography>
      <Typography variant="subheading" className="mt-sm text-center">
        {message}
      </Typography>
      {onRetry ? (
        <Pressable onPress={onRetry} className="mt-md rounded-xl bg-[#0B4A8B] px-lg py-md">
          <Typography variant="button" className="text-brand-white">
            Retry
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});

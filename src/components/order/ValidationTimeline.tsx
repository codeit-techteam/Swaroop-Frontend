import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { ORDER_CONFIRMATION_COPY } from '@/constants/orderTimeline';
import type { ValidationTimelineStep } from '@/types/orderConfirmation';
import { cn } from '@/utils/cn';

type ValidationTimelineProps = {
  steps: ValidationTimelineStep[];
  className?: string;
};

const CompletedCheckIcon = memo(function CompletedCheckIcon() {
  return (
    <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-heading">
      <Typography variant="badge" className="text-[12px] text-brand-white">
        ✓
      </Typography>
    </View>
  );
});

const TimelinePulseDot = memo(function TimelinePulseDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0.15, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="h-7 w-7 items-center justify-center">
      <Animated.View
        className="absolute h-7 w-7 rounded-full bg-brand-primary"
        style={pulseStyle}
      />
      <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-brand-primary bg-brand-white">
        <View className="h-2.5 w-2.5 rounded-full bg-brand-heading" />
      </View>
    </View>
  );
});

const TimelineIndicator = memo(function TimelineIndicator({
  status,
}: {
  status: ValidationTimelineStep['status'];
}) {
  if (status === 'completed') {
    return <CompletedCheckIcon />;
  }

  if (status === 'current') {
    return <TimelinePulseDot />;
  }

  return <View className="h-7 w-7 rounded-full bg-brand-border" />;
});

const TimelineConnector = memo(function TimelineConnector({
  status,
}: {
  status: ValidationTimelineStep['status'];
}) {
  const isCompleted = status === 'completed';

  return (
    <View
      className={cn(
        'my-xs min-h-[24px] w-0.5 flex-1',
        isCompleted ? 'bg-brand-primary' : 'border-l border-dashed border-brand-border bg-transparent',
      )}
      style={!isCompleted ? { borderLeftWidth: 1 } : undefined}
    />
  );
});

export const ValidationTimeline = memo(function ValidationTimeline({
  steps,
  className,
}: ValidationTimelineProps) {
  return (
    <View
      className={cn(
        'w-full rounded-2xl border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
    >
      <Typography variant="roleTitle" className="mb-lg text-[16px] text-brand-heading">
        {ORDER_CONFIRMATION_COPY.validationTimelineHeading}
      </Typography>

      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <View key={step.id} className="flex-row">
            <View className="mr-md items-center">
              <TimelineIndicator status={step.status} />
              {!isLast ? <TimelineConnector status={step.status} /> : null}
            </View>

            <View className={cn('min-w-0 flex-1', !isLast && 'pb-lg')}>
              <Typography
                variant="roleTitle"
                className={cn(
                  'text-[14px]',
                  step.status === 'pending' ? 'text-brand-muted' : 'text-brand-heading',
                )}
              >
                {step.title}
              </Typography>
              {step.subtitle ? (
                <Typography
                  variant="roleDescription"
                  className={cn(
                    'mt-xs text-[12px]',
                    step.status === 'current'
                      ? 'font-semibold text-brand-primary'
                      : step.status === 'pending'
                        ? 'text-brand-muted'
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

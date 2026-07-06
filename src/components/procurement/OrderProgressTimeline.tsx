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
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { OrderProgressStep } from '@/types/procurement';
import { cn } from '@/utils/cn';

type OrderProgressTimelineProps = {
  steps: OrderProgressStep[];
  heading?: string;
  className?: string;
};

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
        <View className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
      </View>
    </View>
  );
});

const TimelineIndicator = memo(function TimelineIndicator({
  status,
}: {
  status: OrderProgressStep['status'];
}) {
  if (status === 'completed') {
    return <CheckCircleIcon size={iconSizes.lg} color={brandColors.success} />;
  }

  if (status === 'current') {
    return <TimelinePulseDot />;
  }

  return <View className="h-7 w-7 rounded-full border-2 border-brand-indicator bg-brand-white" />;
});

const TimelineConnector = memo(function TimelineConnector({ active }: { active: boolean }) {
  return (
    <View
      className={cn(
        'my-xs min-h-[24px] w-0.5 flex-1',
        active ? 'bg-brand-success' : 'bg-brand-border',
      )}
    />
  );
});

export const OrderProgressTimeline = memo(function OrderProgressTimeline({
  steps,
  heading,
  className,
}: OrderProgressTimelineProps) {
  return (
    <View
      className={cn(
        'w-full rounded-2xl border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
    >
      {heading ? (
        <Typography
          variant="fieldLabel"
          className="mb-lg text-[10px] tracking-[0.8px] text-brand-muted"
        >
          {heading.toUpperCase()}
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

import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type LoadingSuccessCardProps = {
  title: string;
  subtitle: string;
  className?: string;
};

export const LoadingSuccessCard = memo(function LoadingSuccessCard({
  title,
  subtitle,
  className,
}: LoadingSuccessCardProps) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.2)) });
    opacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) });
  }, [opacity, scale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      className={cn('items-center rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Animated.View style={badgeStyle}>
        <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-success-light">
          <CheckCircleIcon size={iconSizes.xl} color={brandColors.success} />
        </View>
      </Animated.View>

      <Typography variant="headingLeft" className="mt-lg text-center text-[20px] text-brand-heading">
        {title}
      </Typography>
      <Typography
        variant="subheadingLeft"
        className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
      >
        {subtitle}
      </Typography>
    </View>
  );
});

import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { LightningIcon, ProcurementIllustration } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type ProcurementHeroProps = {
  className?: string;
  title?: string;
  subtitle?: string;
};

export const ProcurementHero = memo(function ProcurementHero({
  className,
  title = PROCUREMENT_SCREEN_COPY.heroTitle,
  subtitle = PROCUREMENT_SCREEN_COPY.heroSubtitle,
}: ProcurementHeroProps) {
  const glow = useSharedValue(0.55);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} className={cn('items-center', className)}>
      <View
        className="w-full items-center overflow-hidden rounded-2xl border border-brand-border bg-brand-white px-md py-lg"
        style={elevation.sm}
      >
        <Animated.View
          style={glowStyle}
          className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-primary-light"
        />
        <Animated.View
          style={glowStyle}
          className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-brand-success-light"
        />
        <ProcurementIllustration width={220} height={160} />
        <View className="mt-sm flex-row items-center gap-xs rounded-full bg-brand-primary-tint px-md py-sm">
          <LightningIcon size={iconSizes.sm} color={brandColors.primary} />
          <Typography variant="badge" className="text-[11px] text-brand-primary">
            Live matching in progress
          </Typography>
        </View>
      </View>

      <Typography
        variant="headingLeft"
        className="mt-xl text-center text-[22px] text-brand-heading"
      >
        {title}
      </Typography>
      <Typography
        variant="subheadingLeft"
        className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
      >
        {subtitle}
      </Typography>
    </Animated.View>
  );
});

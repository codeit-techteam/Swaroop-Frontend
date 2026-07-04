import { memo } from 'react';

import { type GestureResponderEvent, Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { ArrowRightIcon } from '@/icons/arrow-right';
import { borderRadius } from '@/theme/border-radius';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  showArrow?: boolean;
  accessibilityLabel?: string;
};

export const PrimaryButton = memo(function PrimaryButton({
  label,
  onPress,
  className,
  showArrow = true,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn('w-full', className)}
      style={[
        animatedStyle,
        {
          backgroundColor: brandColors.primary,
          borderRadius: borderRadius.md,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          ...elevation.sm,
        },
      ]}
    >
      <View className="flex-row items-center justify-center" style={{ gap: spacing.sm }}>
        <Typography variant="button">{label}</Typography>
        {showArrow ? <ArrowRightIcon /> : null}
      </View>
    </AnimatedPressable>
  );
});

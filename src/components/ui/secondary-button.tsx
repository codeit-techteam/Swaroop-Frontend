import { memo } from 'react';

import { type GestureResponderEvent, Pressable } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SecondaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export const SecondaryButton = memo(function SecondaryButton({
  label,
  onPress,
  className,
  disabled = false,
  accessibilityLabel,
}: SecondaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn(
        'w-full items-center justify-center rounded-md px-xl py-lg',
        disabled ? 'bg-brand-disabled' : 'bg-brand-secondary',
        className,
      )}
      style={animatedStyle}
    >
      <Typography variant="buttonSecondary">{label}</Typography>
    </AnimatedPressable>
  );
});

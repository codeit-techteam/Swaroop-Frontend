import { memo, useCallback } from 'react';

import { type GestureResponderEvent, Pressable, View } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryCTAButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  accessibilityLabel?: string;
};

export const PrimaryCTAButton = memo(function PrimaryCTAButton({
  label,
  onPress,
  className,
  accessibilityLabel,
}: PrimaryCTAButtonProps) {
  const scale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0.4);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
    rippleOpacity.value = withTiming(0.18, { duration: 120 });
    rippleScale.value = withTiming(1.8, { duration: 280 });
  }, [rippleOpacity, rippleScale, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 16, stiffness: 320 });
    rippleOpacity.value = withSequence(
      withTiming(0.12, { duration: 80 }),
      withTiming(0, { duration: 180 }),
    );
    rippleScale.value = withTiming(0.4, { duration: 220 });
  }, [rippleOpacity, rippleScale, scale]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn('overflow-hidden rounded-xl bg-brand-white px-lg py-md shadow-sm', className)}
      style={animatedStyle}
    >
      <Animated.View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <Animated.View className="h-16 w-16 rounded-full bg-brand-primary" style={rippleStyle} />
      </Animated.View>

      <View className="items-center justify-center">
        <Typography variant="button" className="text-[14px] tracking-[0.3px] text-brand-primary">
          {label}
        </Typography>
      </View>
    </AnimatedPressable>
  );
});

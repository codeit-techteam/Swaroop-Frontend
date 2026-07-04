import { memo, type ReactNode } from 'react';

import { ActivityIndicator, type GestureResponderEvent, Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { ArrowRightIcon } from '@/icons/arrow-right';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  showArrow?: boolean;
  leftIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

export const PrimaryButton = memo(function PrimaryButton({
  label,
  onPress,
  className,
  showArrow = false,
  leftIcon,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        if (!isDisabled) {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn(
        'w-full flex-row items-center justify-center rounded-md px-xl py-lg shadow-sm',
        isDisabled ? 'bg-brand-disabled' : 'bg-brand-primary',
        className,
      )}
      style={animatedStyle}
    >
      {loading ? (
        <ActivityIndicator color={brandColors.white} />
      ) : (
        <View className="flex-row items-center justify-center gap-sm">
          {leftIcon}
          <Typography variant="button">{label}</Typography>
          {showArrow ? <ArrowRightIcon /> : null}
        </View>
      )}
    </AnimatedPressable>
  );
});

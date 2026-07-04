import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon } from '@/icons';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type RoleCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onPress: () => void;
  className?: string;
};

export const RoleCard = memo(function RoleCard({
  title,
  description,
  icon,
  selected,
  onPress,
  className,
}: RoleCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 16, stiffness: 280 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 });
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${description}`}
      className={cn(
        'w-full flex-row items-center rounded-lg border-2 px-lg py-lg',
        selected
          ? 'border-brand-primary bg-brand-primary-tint'
          : 'border-brand-border bg-brand-white',
        className,
      )}
      style={animatedStyle}
    >
      <View
        className={cn(
          'mr-md h-12 w-12 items-center justify-center rounded-md',
          selected ? 'bg-brand-primary-light' : 'bg-brand-surface',
        )}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Typography variant="roleTitle">{title}</Typography>
        <Typography variant="roleDescription" className="mt-xs">
          {description}
        </Typography>
      </View>
      {selected ? <CheckCircleIcon /> : <View className="h-5 w-5" />}
    </AnimatedPressable>
  );
});

import { memo, type ReactNode, useEffect } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type RoleCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onPress: () => void;
  highlights?: string[];
  className?: string;
};

export const RoleCard = memo(function RoleCard({
  title,
  description,
  icon,
  selected,
  onPress,
  highlights,
  className,
}: RoleCardProps) {
  const scale = useSharedValue(1);
  const selectedProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected, selectedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [brandColors.border, brandColors.primary],
    ),
    backgroundColor: interpolateColor(
      selectedProgress.value,
      [0, 1],
      [brandColors.white, brandColors.primaryTint],
    ),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.985, { damping: 16, stiffness: 280 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 240 });
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${description}`}
      className={cn('w-full rounded-2xl border-2 px-lg py-lg', className)}
      style={[animatedStyle, selected ? elevation.md : elevation.sm]}
    >
      <View className="flex-row items-center">
        <View
          className={cn(
            'mr-md h-14 w-14 items-center justify-center rounded-full',
            selected ? 'bg-brand-primary' : 'bg-brand-primary-light',
          )}
        >
          {icon}
        </View>
        <View className="flex-1 pr-sm">
          <Typography variant="roleTitle" className="text-[17px]">
            {title}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs leading-[18px]">
            {description}
          </Typography>
        </View>
        {selected ? (
          <CheckCircleIcon size={24} />
        ) : (
          <View className="h-6 w-6 rounded-full border-2 border-brand-indicator" />
        )}
      </View>

      {highlights?.length ? (
        <View className="mt-md flex-row flex-wrap gap-xs">
          {highlights.map((item) => (
            <View
              key={item}
              className={cn(
                'rounded-full px-sm py-xs',
                selected ? 'bg-brand-primary-light' : 'bg-brand-surface',
              )}
            >
              <Typography
                variant="badge"
                className={cn(
                  'text-[11px] normal-case tracking-normal',
                  selected ? 'text-brand-badge-text' : 'text-brand-body',
                )}
              >
                {item}
              </Typography>
            </View>
          ))}
        </View>
      ) : null}
    </AnimatedPressable>
  );
});

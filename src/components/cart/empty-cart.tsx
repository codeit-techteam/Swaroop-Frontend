import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { CartIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type EmptyCartProps = {
  onBrowsePress: () => void;
  className?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const EmptyCart = memo(function EmptyCart({ onBrowsePress, className }: EmptyCartProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      className={cn('flex-1 items-center justify-center px-xl', className)}
    >
      <View className="mb-lg h-28 w-28 items-center justify-center rounded-full bg-brand-primary-light">
        <CartIcon size={iconSizes['2xl']} color={brandColors.primary} />
      </View>

      <Typography variant="headingLeft" className="text-center text-[22px] text-brand-heading">
        Your Cart is Empty
      </Typography>

      <Typography
        variant="subheadingLeft"
        className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
      >
        Browse industrial materials and add products to start your order.
      </Typography>

      <AnimatedPressable
        onPress={onBrowsePress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 16, stiffness: 320 });
        }}
        accessibilityRole="button"
        accessibilityLabel="Browse marketplace"
        className="mt-xl h-12 items-center justify-center rounded-xl bg-brand-heading px-xl"
        style={animatedStyle}
      >
        <Typography variant="button" className="text-[14px] tracking-normal">
          Browse Marketplace
        </Typography>
      </AnimatedPressable>
    </Animated.View>
  );
});

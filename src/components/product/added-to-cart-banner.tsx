import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { Pressable, View } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Typography } from '@/components/ui/typography';
import { ArrowRightIcon, CartIcon, CheckCircleIcon } from '@/icons';
import { selectCartCount, useCartStore } from '@/store/cart-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

const AUTO_DISMISS_MS = 4600;

type AddedToCartBannerProps = {
  visible: boolean;
  title?: string;
  message: string;
  quantityLabel?: string;
  onViewCart?: () => void;
  onDismiss: () => void;
};

const CloseIcon = memo(function CloseIcon({
  size = 12,
  color = brandColors.footer,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M4 4L12 12M12 4L4 12" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
});

export const AddedToCartBanner = memo(function AddedToCartBanner({
  visible,
  title = 'Added to cart',
  message,
  quantityLabel,
  onViewCart,
  onDismiss,
}: AddedToCartBannerProps) {
  const cartCount = useCartStore(selectCartCount);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const translateY = useSharedValue(0);
  const progress = useSharedValue(1);
  const trackWidth = useSharedValue(0);

  const dismiss = useCallback(() => {
    onDismissRef.current();
  }, []);

  useEffect(() => {
    if (!visible) {
      cancelAnimation(progress);
      return;
    }

    translateY.value = 0;
    progress.value = 1;
    progress.value = withTiming(
      0,
      { duration: AUTO_DISMISS_MS, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(dismiss)();
        }
      },
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [dismiss, message, progress, quantityLabel, translateY, visible]);

  const handleViewCart = useCallback(() => {
    dismiss();
    onViewCart?.();
  }, [dismiss, onViewCart]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-16, 24])
        .failOffsetX([-40, 40])
        .onUpdate((event) => {
          translateY.value = Math.min(16, event.translationY);
        })
        .onEnd((event) => {
          if (event.translationY < -36 || event.velocityY < -850) {
            runOnJS(dismiss)();
            return;
          }
          translateY.value = withSpring(0, { damping: 18, stiffness: 240 });
        }),
    [dismiss, translateY],
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: trackWidth.value * progress.value,
  }));

  return (
    <View pointerEvents="box-none" className="absolute left-lg right-lg z-30" style={{ top: 8 }}>
      {visible ? (
        <GestureDetector gesture={pan}>
          <Animated.View
            key={`${quantityLabel ?? ''}-${message}`}
            entering={FadeInDown.springify().damping(16).stiffness(210)}
            exiting={FadeOutUp.duration(180)}
            style={cardStyle}
          >
            <View
              className="overflow-hidden rounded-[24px] border border-[#D1FAE5] bg-brand-white"
              style={[
                elevation.xl,
                {
                  shadowColor: '#15803D',
                  shadowOpacity: 0.14,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 10 },
                },
              ]}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <View className="px-md pt-md">
                <View className="flex-row items-start">
                  <Animated.View
                    entering={ZoomIn.springify().damping(12).stiffness(240).delay(50)}
                    className="mr-md h-12 w-12 items-center justify-center rounded-full bg-brand-success-light"
                    style={{
                      borderWidth: 1.5,
                      borderColor: '#86EFAC',
                    }}
                  >
                    <CheckCircleIcon size={22} color={brandColors.success} />
                  </Animated.View>

                  <View className="min-w-0 flex-1 pr-sm">
                    <Typography
                      variant="roleTitle"
                      className="text-[15px] leading-[20px] text-brand-heading"
                    >
                      {title}
                    </Typography>
                    <View className="mt-xs flex-row items-start">
                      {quantityLabel ? (
                        <View className="mr-sm rounded-full bg-brand-success-light px-sm py-[3px]">
                          <Typography
                            variant="badge"
                            className="text-[10px] tracking-[0.4px] text-brand-success"
                          >
                            {quantityLabel}
                          </Typography>
                        </View>
                      ) : null}
                      <Typography
                        variant="legal"
                        className="min-w-0 flex-1 text-left text-[12px] leading-[16px] text-brand-body"
                        numberOfLines={2}
                      >
                        {message}
                      </Typography>
                    </View>
                  </View>

                  <Pressable
                    onPress={dismiss}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss notification"
                    className="h-8 w-8 items-center justify-center rounded-full bg-brand-surface"
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <CloseIcon />
                  </Pressable>
                </View>

                {onViewCart ? (
                  <Pressable
                    onPress={handleViewCart}
                    accessibilityRole="button"
                    accessibilityLabel={
                      cartCount > 0 ? `View cart, ${cartCount} items` : 'View cart'
                    }
                    className="mt-md h-11 flex-row items-center justify-center rounded-2xl bg-brand-heading px-lg"
                    style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
                  >
                    <CartIcon size={16} color={brandColors.white} />
                    <Typography
                      variant="button"
                      className="mx-sm text-[14px] tracking-normal text-brand-white"
                    >
                      View Cart
                    </Typography>
                    {cartCount > 0 ? (
                      <View
                        className="mr-sm h-5 min-w-5 items-center justify-center rounded-full px-xs"
                        style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                      >
                        <Typography
                          variant="badge"
                          className="text-[10px] tracking-normal text-brand-white"
                        >
                          {cartCount}
                        </Typography>
                      </View>
                    ) : null}
                    <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
                  </Pressable>
                ) : null}
              </View>

              <View
                className="mt-md h-[3px] w-full bg-[#DCFCE7]"
                onLayout={(event) => {
                  trackWidth.value = event.nativeEvent.layout.width;
                }}
              >
                <Animated.View className="h-full bg-brand-success" style={barStyle} />
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
});

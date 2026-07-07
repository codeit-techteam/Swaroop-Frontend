import { useCallback, useEffect } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingSpinner, Typography } from '@/components';
import { PetroTradeLogo } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { spacing } from '@/theme/spacing';

const SPLASH_VISIBLE_MS = 2000;
const FADE_IN_MS = 500;
const FADE_OUT_MS = 400;
const SCALE_FROM = 0.88;

export const SplashScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(SCALE_FROM);
  const contentOpacity = useSharedValue(0);

  const routeAfterSplash = useCallback(() => {
    // Read the freshest hydrated session so the branded splash always shows on
    // cold start, then hands off to the correct destination.
    const { isLoggedIn, kycApproved, onboardingCompleted } = useAuthStore.getState();

    if (isLoggedIn && kycApproved) {
      router.replace(ROUTES.CUSTOMER.HOME as Href);
      return;
    }

    if (isLoggedIn && !kycApproved) {
      router.replace(ROUTES.AUTH.BUSINESS_INFORMATION as Href);
      return;
    }

    if (onboardingCompleted) {
      router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
      return;
    }

    router.replace(ROUTES.ONBOARDING.INTRO_ONE as Href);
  }, [router]);

  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => {
      opacity.value = withTiming(
        0,
        { duration: FADE_OUT_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(routeAfterSplash)();
          }
        },
      );
    }, SPLASH_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [contentOpacity, routeAfterSplash, opacity, scale]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View className="flex-1" style={[{ backgroundColor: brandColors.white }, screenStyle]}>
      <View className="flex-1 items-center justify-center px-xl">
        <Animated.View className="items-center" style={brandStyle}>
          <PetroTradeLogo size={iconSizes.logo} color={brandColors.navy} />
          <Typography variant="splashTitle" style={{ marginTop: spacing.logoGap }}>
            PETROTRADE
          </Typography>
          <Typography
            variant="splashTagline"
            style={{ marginTop: spacing.titleGap, maxWidth: 260 }}
          >
            SMART INDUSTRIAL TRADING & LOGISTICS
          </Typography>
        </Animated.View>
      </View>

      <Animated.View
        className="items-center"
        style={[
          brandStyle,
          { paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing['4xl'] },
        ]}
      >
        <LoadingSpinner />
        <Typography variant="splashStatus" style={{ marginTop: spacing.md }}>
          INITIALIZING SECURE TERMINAL
        </Typography>
      </Animated.View>
    </Animated.View>
  );
};

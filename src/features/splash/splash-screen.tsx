import { useCallback, useEffect, useRef } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingSpinner, Typography } from '@/components';
import { PetroTradeLogo } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { getLoggedInRoute } from '@/navigation/post-auth-route';
import { useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { spacing } from '@/theme/spacing';

const SPLASH_VISIBLE_MS = 2000;
const FADE_IN_MS = 500;
const SCALE_FROM = 0.88;

export const SplashScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasRoutedRef = useRef(false);
  const scale = useSharedValue(SCALE_FROM);
  const contentOpacity = useSharedValue(1);

  const routeAfterSplash = useCallback(() => {
    if (hasRoutedRef.current) {
      return;
    }
    hasRoutedRef.current = true;

    const authStore = useAuthStore.getState();
    authStore.resolvePendingKycApproval();

    const { isLoggedIn, kycApproved, reviewSubmitted, onboardingCompleted } =
      useAuthStore.getState();

    if (isLoggedIn) {
      router.replace(getLoggedInRoute({ kycApproved, reviewSubmitted }));
      return;
    }

    if (onboardingCompleted) {
      router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
      return;
    }

    router.replace(ROUTES.ONBOARDING.INTRO_ONE as Href);
  }, [router]);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(routeAfterSplash, SPLASH_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [routeAfterSplash, scale]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1" style={{ backgroundColor: brandColors.white }}>
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
    </View>
  );
};

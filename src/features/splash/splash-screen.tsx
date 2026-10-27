import { useCallback, useEffect, useRef } from 'react';

import { Dimensions, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { LoadingSpinner, Typography } from '@/components';
import { AppLogo } from '@/components/ui/app-logo';
import { getLoggedInRoute } from '@/navigation/post-auth-route';
import { ROUTES } from '@/navigation/routes';
import { isSellerOnboardingComplete } from '@/seller/mock/mockSellerService';
import { getSellerInitialRoute } from '@/seller/navigation/getSellerInitialRoute';
import {
  isKnownExistingDemoSeller,
  resolveSellerHomeAccess,
} from '@/seller/navigation/resolveSellerHome';
import { useSellerStore } from '@/seller/store/sellerStore';
import { refreshKycStatus } from '@/services/kyc-status-sync';
import { useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { spacing } from '@/theme/spacing';

const SPLASH_VISIBLE_MS = 2200;
const FADE_IN_MS = 650;
const SCALE_FROM = 0.92;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function SplashAtmosphere() {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
    >
      <Svg width={SCREEN_W} height={SCREEN_H}>
        <Defs>
          <LinearGradient id="splashBg" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor={brandColors.primaryTint} />
            <Stop offset="42%" stopColor={brandColors.white} />
            <Stop offset="100%" stopColor="#EEF3FA" />
          </LinearGradient>
          <LinearGradient id="splashGlow" x1="0.5" y1="0.18" x2="0.5" y2="0.72">
            <Stop offset="0%" stopColor={brandColors.primaryLight} stopOpacity={0.9} />
            <Stop offset="55%" stopColor={brandColors.primaryLight} stopOpacity={0.28} />
            <Stop offset="100%" stopColor={brandColors.white} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={SCREEN_W} height={SCREEN_H} fill="url(#splashBg)" />
        <Rect x={0} y={0} width={SCREEN_W} height={SCREEN_H} fill="url(#splashGlow)" />
        <Circle
          cx={SCREEN_W * 0.88}
          cy={SCREEN_H * 0.12}
          r={SCREEN_W * 0.3}
          fill={brandColors.accent}
          opacity={0.07}
        />
        <Circle
          cx={SCREEN_W * 0.06}
          cy={SCREEN_H * 0.78}
          r={SCREEN_W * 0.36}
          fill={brandColors.primary}
          opacity={0.045}
        />
      </Svg>
    </View>
  );
}

export const SplashScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasRoutedRef = useRef(false);
  const scale = useSharedValue(SCALE_FROM);
  const contentOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  const routeAfterSplash = useCallback(() => {
    if (hasRoutedRef.current) {
      return;
    }
    hasRoutedRef.current = true;

    void (async () => {
      const authStore = useAuthStore.getState();
      const sellerSnapshot = useSellerStore.getState();
      const sellerSession = sellerSnapshot.sellerLoggedIn && authStore.selectedRole === 'seller';
      if (authStore.isLoggedIn && !sellerSession) {
        await refreshKycStatus();
      }

      const { isLoggedIn, kycApproved, reviewSubmitted, onboardingCompleted } =
        useAuthStore.getState();

      if (sellerSession) {
        if (!isSellerOnboardingComplete(sellerSnapshot)) {
          const access = await resolveSellerHomeAccess();
          if (
            access === 'unknown' &&
            sellerSnapshot.otpVerified &&
            isKnownExistingDemoSeller(sellerSnapshot.mobile)
          ) {
            useSellerStore.getState().grantExistingSellerAccess();
          }
        }
        router.replace(getSellerInitialRoute(useSellerStore.getState()));
        return;
      }

      if (isLoggedIn) {
        router.replace(getLoggedInRoute({ kycApproved, reviewSubmitted }));
        return;
      }

      if (onboardingCompleted) {
        router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
        return;
      }

      router.replace(ROUTES.ONBOARDING.INTRO_ONE as Href);
    })();
  }, [router]);

  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
    });
    footerOpacity.value = withDelay(
      280,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
    );

    const timer = setTimeout(routeAfterSplash, SPLASH_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [contentOpacity, footerOpacity, routeAfterSplash, scale]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View className="flex-1" style={{ backgroundColor: brandColors.primaryTint }}>
      <SplashAtmosphere />

      <View className="flex-1 items-center justify-center px-xl">
        <Animated.View className="items-center" style={brandStyle}>
          <View className="items-center justify-center">
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: brandColors.white,
                opacity: 0.55,
                top: -20,
              }}
            />
            <AppLogo variant="splash" size={iconSizes.logo} />
          </View>

          <Animated.View
            entering={FadeInDown.delay(220).duration(480)}
            className="items-center"
            style={{ marginTop: spacing.xl }}
          >
            <View
              style={{
                width: 40,
                height: 3,
                borderRadius: 2,
                backgroundColor: brandColors.accent,
                marginBottom: spacing.lg,
              }}
            />
            <Typography variant="splashTagline" style={{ maxWidth: 280 }}>
              Smart industrial trading & logistics
            </Typography>
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View
        className="items-center"
        style={[
          footerStyle,
          { paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing['4xl'] },
        ]}
      >
        <LoadingSpinner size={26} strokeWidth={2.5} color={brandColors.primary} />
        <Typography variant="splashStatus" style={{ marginTop: spacing.md }}>
          Preparing secure session
        </Typography>
      </Animated.View>
    </View>
  );
};

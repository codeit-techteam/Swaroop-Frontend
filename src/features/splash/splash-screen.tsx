import { useCallback, useEffect, useRef, useState } from 'react';

import { AccessibilityInfo, Dimensions, Image, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingSpinner, Typography } from '@/components';
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
import { spacing } from '@/theme/spacing';

const logoFullSource = require('../../../assets/logo/polystorex-logo.png');

/** Keep splash short — navigation must not feel delayed. */
const SPLASH_VISIBLE_MS = 2400;
const SPLASH_REDUCED_MS = 400;
const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_WIDTH = Math.min(SCREEN_W * 0.78, 340);

export const SplashScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasRoutedRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const orbitOpacity = useSharedValue(0);
  const orbitScale = useSharedValue(0.86);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslate = useSharedValue(14);
  const underlineProgress = useSharedValue(0);
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
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });
    return () => {
      mounted = false;
      // RN versions differ on subscription shape
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sub as any)?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      orbitOpacity.value = 1;
      orbitScale.value = 1;
      wordmarkOpacity.value = 1;
      wordmarkTranslate.value = 0;
      underlineProgress.value = 1;
      footerOpacity.value = 1;
      const timer = setTimeout(routeAfterSplash, SPLASH_REDUCED_MS);
      return () => clearTimeout(timer);
    }

    // 1–2. Orbit + full lockup fade/scale in
    orbitOpacity.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
    orbitScale.value = withTiming(1, {
      duration: 620,
      easing: Easing.out(Easing.cubic),
    });
    // 3–4. Wordmark settle (artwork includes wordmark; subtle secondary motion)
    wordmarkOpacity.value = withDelay(
      180,
      withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }),
    );
    wordmarkTranslate.value = withDelay(
      180,
      withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) }),
    );
    // 5. Gold underline draw (scaleX on a thin gold bar under the lockup)
    underlineProgress.value = withDelay(
      420,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
    footerOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );

    const timer = setTimeout(routeAfterSplash, SPLASH_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [
    footerOpacity,
    orbitOpacity,
    orbitScale,
    reduceMotion,
    routeAfterSplash,
    underlineProgress,
    wordmarkOpacity,
    wordmarkTranslate,
  ]);

  const lockupStyle = useAnimatedStyle(() => ({
    opacity: orbitOpacity.value,
    transform: [{ scale: orbitScale.value }, { translateY: wordmarkTranslate.value }],
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    opacity: underlineProgress.value,
    transform: [{ scaleX: Math.max(underlineProgress.value, 0.08) }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View className="flex-1" style={{ backgroundColor: '#000000' }}>
      <View className="flex-1 items-center justify-center px-xl">
        <Animated.View className="items-center" style={lockupStyle}>
          <Image
            source={logoFullSource}
            style={{ width: LOGO_WIDTH, height: LOGO_WIDTH * 0.5 }}
            resizeMode="contain"
            accessibilityLabel="PolyStoreX"
            accessibilityIgnoresInvertColors
          />
          <Animated.View
            style={[
              underlineStyle,
              {
                marginTop: spacing.md,
                height: 2,
                width: LOGO_WIDTH * 0.72,
                borderRadius: 2,
                backgroundColor: brandColors.accent,
              },
            ]}
          />
        </Animated.View>
      </View>

      <Animated.View
        className="items-center"
        style={[
          footerStyle,
          { paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing['4xl'] },
        ]}
      >
        <LoadingSpinner size={26} strokeWidth={2.5} color={brandColors.accent} />
        <Typography
          variant="splashStatus"
          style={{ marginTop: spacing.md, color: 'rgba(255,255,255,0.72)' }}
        >
          Preparing secure session
        </Typography>
      </Animated.View>
    </View>
  );
};

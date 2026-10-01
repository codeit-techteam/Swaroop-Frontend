import { useCallback, useEffect, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { AuthCard, FooterLinks, OtpInput, ScreenWrapper, Typography } from '@/components';
import { DEMO_OTP, DEMO_USER_NAME, isOfflineBackendFallbackEnabled } from '@/config/development';
import { SELLER_RESEND_SECONDS } from '@/seller/constants';
import { getSellerInitialRoute } from '@/seller/navigation/getSellerInitialRoute';
import {
  isKnownExistingDemoSeller,
  resolveSellerHomeAccess,
} from '@/seller/navigation/resolveSellerHome';
import { useSellerStore } from '@/seller/store/sellerStore';
import {
  authenticateSellerFromOtp,
  requestSellerOtpSend,
} from '@/services/seller-auth';
import { SellerHeader, SellerPrimaryButton } from '@/seller/components';

const formatTimer = (seconds: number): string => `00:${seconds.toString().padStart(2, '0')}`;

export const SellerOtpScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ mobile?: string }>();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(SELLER_RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const setMobile = useSellerStore((state) => state.setMobile);
  const markOtpVerified = useSellerStore((state) => state.markOtpVerified);
  const grantExistingSellerAccess = useSellerStore((state) => state.grantExistingSellerAccess);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      setSecondsLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = useCallback(async () => {
    const mobile = params.mobile ?? '';
    setIsVerifying(true);
    setOtpError(undefined);
    try {
      const result = await authenticateSellerFromOtp(mobile, otp);
      if (!result.ok) {
        if (!isOfflineBackendFallbackEnabled()) {
          setOtpError(result.message);
          return;
        }
        // Offline DEV fallback: still mark local session so UI remains usable.
        if (otp !== DEMO_OTP) {
          setOtpError(result.message);
          return;
        }
      }

      setMobile(mobile);
      void useSellerStore.getState().refreshSellerAccount();

      const access = await resolveSellerHomeAccess();
      const openHome =
        access === 'home' ||
        (access === 'unknown' && isKnownExistingDemoSeller(mobile, otp));

      if (openHome && access !== 'home') {
        grantExistingSellerAccess();
      } else if (!openHome) {
        markOtpVerified();
      }

      router.replace(getSellerInitialRoute(useSellerStore.getState()) as Href);
    } finally {
      setIsVerifying(false);
    }
  }, [grantExistingSellerAccess, markOtpVerified, otp, params.mobile, router, setMobile]);

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || isResending) return;
    const mobile = params.mobile ?? '';
    setIsResending(true);
    try {
      await requestSellerOtpSend(mobile);
      setOtp('');
      setOtpError(undefined);
      setSecondsLeft(SELLER_RESEND_SECONDS);
    } finally {
      setIsResending(false);
    }
  }, [isResending, params.mobile, secondsLeft]);

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader showBack title="Seller OTP Verification" onBack={() => router.back()} />

      <AuthCard className="mt-md rounded-2xl">
        <Pressable onPress={() => router.back()}>
          <Typography variant="link">Back to Login</Typography>
        </Pressable>

        <Typography variant="headingLeft" className="mt-lg">
          Verify Mobile Number
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Enter the 6-digit OTP sent to +91 {params.mobile ?? ''}.
        </Typography>
        <Typography variant="legal" className="mt-sm text-left">
          Dev login: {DEMO_USER_NAME} · OTP {DEMO_OTP}
        </Typography>

        <OtpInput
          value={otp}
          onChange={(value) => {
            setOtp(value);
            setOtpError(undefined);
          }}
          error={otpError}
          className="mt-xl"
        />

        <Typography variant="legal" className="mt-lg">
          Resend OTP in {formatTimer(secondsLeft)}
        </Typography>
        <Pressable
          onPress={() => {
            void handleResend();
          }}
          className="mt-sm self-center"
          disabled={secondsLeft > 0 || isResending}
        >
          <Typography
            variant="link"
            className={secondsLeft === 0 ? 'text-brand-primary' : 'text-brand-muted'}
          >
            {isResending ? 'Sending…' : 'Resend OTP'}
          </Typography>
        </Pressable>

        <SellerPrimaryButton
          label={isVerifying ? 'Verifying…' : 'Verify & Continue'}
          className="mt-xl"
          disabled={otp.length !== 6 || isVerifying}
          onPress={() => {
            void handleVerify();
          }}
        />

        <View className="mt-lg rounded-2xl bg-brand-surface p-md">
          <Typography variant="legal" className="text-left">
            Demo OTP: {DEMO_OTP} (same as Seller Web)
          </Typography>
        </View>
      </AuthCard>

      <FooterLinks className="mt-2xl" />
    </ScreenWrapper>
  );
};

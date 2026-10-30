import { useCallback, useEffect, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTES } from '@/navigation/routes';
import { safeGoBack } from '@/navigation/safe-back';

import {
  AuthCard,
  FooterLinks,
  OtpInput,
  PrimaryButton,
  ScreenWrapper,
  Typography,
} from '@/components';
import { DEMO_OTP, DEMO_USER_NAME } from '@/config/development';
import { SellerHeader } from '@/seller/components';
import { SELLER_RESEND_SECONDS } from '@/seller/constants';
import { getSellerInitialRoute } from '@/seller/navigation/getSellerInitialRoute';
import { resolveSellerHomeAccess } from '@/seller/navigation/resolveSellerHome';
import { useSellerStore } from '@/seller/store/sellerStore';
import {
  authenticateSellerFromOtp,
  requestSellerOtpSend,
  type SellerOtpPurpose,
} from '@/services/seller-auth';
import { seedSellerSignupOnboarding } from '@/services/seller-onboarding';

const formatTimer = (seconds: number): string => `00:${seconds.toString().padStart(2, '0')}`;

export const SellerOtpScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ mobile?: string; source?: string }>();
  const isRegister = params.source === 'register';
  const otpPurpose: SellerOtpPurpose = isRegister ? 'SIGNUP' : 'LOGIN';
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(SELLER_RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const setMobile = useSellerStore((state) => state.setMobile);
  const markOtpVerified = useSellerStore((state) => state.markOtpVerified);
  const clearSignupDraft = useSellerStore((state) => state.clearSignupDraft);
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
    if (otp.length !== 6 || isVerifying) return;
    setIsVerifying(true);
    setOtpError(undefined);
    try {
      const signupDraft = useSellerStore.getState().signupDraft;
      const result = await authenticateSellerFromOtp(
        mobile,
        otp,
        otpPurpose,
        isRegister && signupDraft
          ? {
              fullName: signupDraft.fullName,
              companyName: signupDraft.companyName,
              gstNumber: signupDraft.gstNumber,
            }
          : undefined,
      );
      if (!result.ok) {
        setOtpError(result.message);
        return;
      }

      setMobile(mobile);
      void useSellerStore.getState().refreshSellerAccount();

      if (isRegister && signupDraft) {
        await seedSellerSignupOnboarding(signupDraft).catch(() => undefined);
        clearSignupDraft();
        markOtpVerified();
        router.replace(ROUTES.SELLER.COMPANY as Href);
        return;
      }

      clearSignupDraft();
      const access = await resolveSellerHomeAccess();
      if (access === 'home') {
        grantExistingSellerAccess();
      } else {
        markOtpVerified();
      }

      router.replace(getSellerInitialRoute(useSellerStore.getState()) as Href);
    } finally {
      setIsVerifying(false);
    }
  }, [
    clearSignupDraft,
    grantExistingSellerAccess,
    isRegister,
    isVerifying,
    markOtpVerified,
    otp,
    otpPurpose,
    params.mobile,
    router,
    setMobile,
  ]);

  // Auto-submit when the sixth digit is entered (L-10).
  useEffect(() => {
    if (otp.length === 6 && !isVerifying && !otpError) {
      void handleVerify();
    }
    // Only react to length completing — avoid loops on error.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-shot on 6 digits
  }, [otp]);

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || isResending) return;
    const mobile = params.mobile ?? '';
    setIsResending(true);
    try {
      await requestSellerOtpSend(mobile, otpPurpose);
      setOtp('');
      setOtpError(undefined);
      setSecondsLeft(SELLER_RESEND_SECONDS);
    } finally {
      setIsResending(false);
    }
  }, [isResending, otpPurpose, params.mobile, secondsLeft]);

  const backHref = isRegister ? ROUTES.SELLER.REGISTER : ROUTES.SELLER.LOGIN;

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader showBack title="Seller OTP Verification" />

      <AuthCard className="mt-md">
        <Pressable onPress={() => safeGoBack(router, backHref as Href)}>
          <Typography variant="link">
            {isRegister ? 'Back to Sign Up' : 'Back to Login'}
          </Typography>
        </Pressable>

        <Typography variant="headingLeft" className="mt-lg">
          Verify Mobile Number
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Enter the 6-digit OTP sent to +91 {params.mobile ?? ''}.
        </Typography>
        {isRegister ? (
          <Typography variant="legal" className="mt-sm text-left">
            After verification, complete onboarding so Admin can review your seller application.
          </Typography>
        ) : null}
        {__DEV__ ? (
          <Typography variant="legal" className="mt-sm text-left">
            Dev login: {DEMO_USER_NAME} · OTP {DEMO_OTP}
          </Typography>
        ) : null}

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

        <PrimaryButton
          label={isVerifying ? 'Verifying…' : 'Verify & Continue'}
          className="mt-xl"
          disabled={otp.length !== 6 || isVerifying}
          loading={isVerifying}
          onPress={() => {
            void handleVerify();
          }}
        />

        {__DEV__ ? (
          <View className="mt-lg rounded-md bg-brand-surface p-md">
            <Typography variant="legal" className="text-left">
              Demo OTP: {DEMO_OTP} (same as Seller Web)
            </Typography>
          </View>
        ) : null}
      </AuthCard>

      <FooterLinks className="mt-2xl" />
    </ScreenWrapper>
  );
};

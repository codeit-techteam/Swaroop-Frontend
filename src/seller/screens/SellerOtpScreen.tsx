import { useCallback, useEffect, useRef, useState } from 'react';

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
import { DEMO_OTP, DEMO_USER_NAME, isDevAuthEnabled } from '@/config/development';
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
import { maskIndianMobile } from '@/utils/phone-input';

const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

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
  const verifyingRef = useRef(false);
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

  const handleVerify = useCallback(async (code?: string) => {
    const mobile = params.mobile ?? '';
    const otpCode = code ?? otp;
    // L-10: auto-submit (6th digit) and Verify can fire together — ref closes that window.
    if (otpCode.length !== 6 || verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);
    setOtpError(undefined);
    try {
      const signupDraft = useSellerStore.getState().signupDraft;
      const result = await authenticateSellerFromOtp(
        mobile,
        otpCode,
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
        verifyingRef.current = false;
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
    } catch {
      setOtpError('Unable to verify OTP. Please try again.');
      verifyingRef.current = false;
    } finally {
      setIsVerifying(false);
    }
  }, [
    clearSignupDraft,
    grantExistingSellerAccess,
    isRegister,
    markOtpVerified,
    otp,
    otpPurpose,
    params.mobile,
    router,
    setMobile,
  ]);

  const handleOtpChange = useCallback(
    (value: string) => {
      setOtp(value);
      setOtpError(undefined);
      if (value.length === 6) {
        void handleVerify(value);
      }
    },
    [handleVerify],
  );

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || isResending) return;
    const mobile = params.mobile ?? '';
    setIsResending(true);
    try {
      const result = await requestSellerOtpSend(mobile, otpPurpose, { resend: true });
      if (!result.ok) {
        setOtpError(result.message ?? 'Unable to resend OTP. Please try again.');
        return;
      }
      setOtp('');
      setOtpError(undefined);
      setSecondsLeft(result.resendCooldownSeconds ?? SELLER_RESEND_SECONDS);
    } finally {
      setIsResending(false);
    }
  }, [isResending, otpPurpose, params.mobile, secondsLeft]);

  const backHref = isRegister ? ROUTES.SELLER.REGISTER : ROUTES.SELLER.LOGIN;
  const phoneDisplay = maskIndianMobile(params.mobile);

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader showBack title="Seller OTP Verification" />

      <AuthCard className="mt-md">
        <Pressable
          onPress={() => safeGoBack(router, backHref as Href)}
          accessibilityRole="button"
          accessibilityLabel="Change Number"
        >
          <Typography variant="link">
            {isRegister ? 'Back to Sign Up' : 'Change Number'}
          </Typography>
        </Pressable>

        <Typography variant="headingLeft" className="mt-lg">
          Verify Mobile Number
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Enter the 6-digit verification code sent to {phoneDisplay}.
        </Typography>
        {isRegister ? (
          <Typography variant="legal" className="mt-sm text-left">
            After verification, complete onboarding so Admin can review your seller application.
          </Typography>
        ) : null}
        {isDevAuthEnabled() ? (
          <Typography variant="legal" className="mt-sm text-left">
            Dev login: {DEMO_USER_NAME} · OTP {DEMO_OTP}
          </Typography>
        ) : null}

        <OtpInput
          value={otp}
          onChange={handleOtpChange}
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
          label={isVerifying ? 'Verifying…' : 'Verify & Proceed'}
          className="mt-xl"
          disabled={otp.length !== 6 || isVerifying}
          loading={isVerifying}
          onPress={() => {
            void handleVerify();
          }}
        />

        {isDevAuthEnabled() ? (
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

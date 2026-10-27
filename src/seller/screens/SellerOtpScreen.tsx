import { useCallback, useEffect, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTES } from '@/navigation/routes';
import { safeGoBack } from '@/navigation/safe-back';

import { AuthCard, FooterLinks, OtpInput, ScreenWrapper, Typography } from '@/components';
import { DEMO_OTP, DEMO_USER_NAME, DEVELOPMENT_MODE } from '@/config/development';
import { SellerHeader, SellerPrimaryButton } from '@/seller/components';
import { SELLER_RESEND_SECONDS } from '@/seller/constants';
import { getSellerInitialRoute } from '@/seller/navigation/getSellerInitialRoute';
import { resolveSellerHomeAccess } from '@/seller/navigation/resolveSellerHome';
import { useSellerStore } from '@/seller/store/sellerStore';
import { authenticateSellerFromOtp, requestSellerOtpSend } from '@/services/seller-auth';

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
    if (otp.length !== 6 || isVerifying) return;
    setIsVerifying(true);
    setOtpError(undefined);
    try {
      const result = await authenticateSellerFromOtp(mobile, otp);
      if (!result.ok) {
        setOtpError(result.message);
        return;
      }

      setMobile(mobile);
      void useSellerStore.getState().refreshSellerAccount();

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
    grantExistingSellerAccess,
    isVerifying,
    markOtpVerified,
    otp,
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
      <SellerHeader showBack title="Seller OTP Verification" />

      <AuthCard className="mt-md rounded-2xl">
        <Pressable onPress={() => safeGoBack(router, ROUTES.SELLER.LOGIN as Href)}>
          <Typography variant="link">Back to Login</Typography>
        </Pressable>

        <Typography variant="headingLeft" className="mt-lg">
          Verify Mobile Number
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Enter the 6-digit OTP sent to +91 {params.mobile ?? ''}.
        </Typography>
        {DEVELOPMENT_MODE ? (
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

        <SellerPrimaryButton
          label={isVerifying ? 'Verifying…' : 'Verify & Continue'}
          className="mt-xl"
          disabled={otp.length !== 6 || isVerifying}
          onPress={() => {
            void handleVerify();
          }}
        />

        {DEVELOPMENT_MODE ? (
          <View className="mt-lg rounded-2xl bg-brand-surface p-md">
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

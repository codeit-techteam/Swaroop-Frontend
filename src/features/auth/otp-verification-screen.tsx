import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppHeader,
  IllustrationCard,
  OtpInput,
  PrimaryButton,
  ScreenWrapper,
  Typography,
} from '@/components';
import { DEMO_OTP, DEMO_USER_NAME, DEVELOPMENT_MODE } from '@/config/development';
import { ClockIcon, OtpIllustration } from '@/icons';
import { parseReturnToParam, resolvePostAuthHref } from '@/navigation/return-to';
import { ROUTES } from '@/navigation/routes';
import { safeGoBack } from '@/navigation/safe-back';
import {
  customerAuthErrorMessage,
  isOtpCooldownError,
  sendCustomerOtp,
  verifyCustomerOtp,
  type CustomerOtpPurpose,
} from '@/services/customer-auth';
import { getInvalidOtpMessage, isDevAccount, validateDevOtp } from '@/services/dev-auth';
import { refreshKycStatus } from '@/services/kyc-status-sync';
import { resetUserScopedState } from '@/services/sign-out';
import { useAuthStore } from '@/store/auth-store';
import { wp } from '@/utils/responsive';

const RESEND_SECONDS = 44;

const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const formatPhone = (phone?: string): string => {
  if (!phone || phone.length < 10) {
    return '+91 98765 43210';
  }
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
};

export const OtpVerificationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phone?: string;
    source?: string;
    returnTo?: string | string[];
  }>();
  const returnTo = parseReturnToParam(params.returnTo);
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyingRef = useRef(false);
  const purpose: CustomerOtpPurpose = params.source === 'register' ? 'SIGNUP' : 'LOGIN';

  const phoneDisplay = useMemo(() => formatPhone(params.phone), [params.phone]);
  const isOtpComplete = otp.length === 6;
  const canResend = secondsLeft === 0;

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleBack = useCallback(() => {
    safeGoBack(router, ROUTES.AUTH.CUSTOMER_LOGIN as Href);
  }, [router]);

  const handleResend = useCallback(async () => {
    if (!canResend) {
      return;
    }
    setOtp('');
    setOtpError(undefined);
    try {
      await sendCustomerOtp(params.phone ?? '', purpose);
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      if (isOtpCooldownError(error)) {
        setSecondsLeft(RESEND_SECONDS);
        return;
      }
      setOtpError(customerAuthErrorMessage(error, 'Unable to resend OTP. Please try again.'));
    }
  }, [canResend, params.phone, purpose]);

  const handleVerify = useCallback(
    async (code: string) => {
      // L-10: auto-submit (6th digit) and the Verify button can fire in the same
      // tick; the ref closes that window before `isVerifying` has re-rendered.
      if (code.length !== 6 || verifyingRef.current) {
        return;
      }
      verifyingRef.current = true;

      const mobileNumber = params.phone ?? '';
      const role = useAuthStore.getState().selectedRole === 'seller' ? 'seller' : 'customer';

      // Local Metro only: reject wrong demo OTP early for the seeded account.
      if (DEVELOPMENT_MODE && isDevAccount(mobileNumber) && !validateDevOtp(code)) {
        setOtpError(getInvalidOtpMessage());
        verifyingRef.current = false;
        return;
      }

      setIsVerifying(true);
      try {
        await verifyCustomerOtp(
          mobileNumber,
          code,
          purpose,
          role === 'seller' ? 'SELLER' : 'CUSTOMER',
        );
      } catch (error) {
        setOtpError(customerAuthErrorMessage(error, 'Invalid OTP. Please try again.'));
        setIsVerifying(false);
        verifyingRef.current = false;
        return;
      }

      const previousMobile = useAuthStore.getState().mobileNumber;
      if (previousMobile && previousMobile !== mobileNumber) resetUserScopedState();
      completeLogin(mobileNumber);
      if (role === 'customer') {
        await refreshKycStatus();
      }
      setIsVerifying(false);
      verifyingRef.current = false;

      const { kycApproved, reviewSubmitted } = useAuthStore.getState();
      router.replace(resolvePostAuthHref({ returnTo, kycApproved, reviewSubmitted }));
    },
    [completeLogin, params.phone, purpose, returnTo, router],
  );

  // Auto-submit as soon as the sixth digit lands (L-10) — driven by the input
  // event rather than an effect so it cannot re-fire on unrelated re-renders.
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

  return (
    <ScreenWrapper className="bg-brand-white">
      <AppHeader variant="back" title="Verification" onBack={handleBack} />

      <View className="flex-1 items-center pt-lg">
        <IllustrationCard className="mb-xl">
          <OtpIllustration width={wp(55)} height={wp(44)} />
        </IllustrationCard>

        <Typography variant="headingLeft" className="text-center">
          Verify Your Number
        </Typography>
        <Typography variant="subheading" className="mt-sm px-md">
          Enter the 6-digit code sent to {phoneDisplay}
        </Typography>
        {DEVELOPMENT_MODE ? (
          <Typography variant="legal" className="mt-sm px-md text-center">
            Dev: {DEMO_USER_NAME} · OTP {DEMO_OTP}
          </Typography>
        ) : null}

        <OtpInput value={otp} onChange={handleOtpChange} error={otpError} className="mt-2xl" />

        <View className="mt-xl items-center gap-sm">
          <View className="flex-row items-center gap-xs">
            <ClockIcon />
            <Typography variant="legal">Resend code in {formatTimer(secondsLeft)}</Typography>
          </View>
          <Pressable
            onPress={() => {
              void handleResend();
            }}
            disabled={!canResend}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canResend }}
          >
            <Typography
              variant="link"
              className={canResend ? 'text-brand-primary' : 'text-brand-muted'}
            >
              Resend OTP
            </Typography>
          </Pressable>
        </View>
      </View>

      <View className="pb-md">
        <PrimaryButton
          label="Verify & Continue"
          disabled={!isOtpComplete}
          loading={isVerifying}
          onPress={() => {
            void handleVerify(otp);
          }}
        />
        <Typography variant="legal" className="mt-lg px-md">
          Secure multi-factor authentication for authorized PolyStoreX personnel only.
        </Typography>
      </View>
    </ScreenWrapper>
  );
};

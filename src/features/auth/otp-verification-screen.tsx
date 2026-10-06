import { useCallback, useEffect, useMemo, useState } from 'react';

import { Pressable, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppHeader,
  IllustrationCard,
  OtpInput,
  PrimaryButton,
  ScreenWrapper,
  Typography,
} from '@/components';
import { ClockIcon, OtpIllustration } from '@/icons';
import { getLoggedInRoute } from '@/navigation/post-auth-route';
import {
  customerAuthErrorMessage,
  isOtpCooldownError,
  sendCustomerOtp,
  verifyCustomerOtp,
  type CustomerOtpPurpose,
} from '@/services/customer-auth';
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
  const params = useLocalSearchParams<{ phone?: string; source?: string }>();
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
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
    router.back();
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

  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    setOtpError(undefined);
  }, []);

  const handleVerify = useCallback(async () => {
    if (!isOtpComplete || isVerifying) {
      return;
    }

    const mobileNumber = params.phone ?? '';
    const role = useAuthStore.getState().selectedRole === 'seller' ? 'seller' : 'customer';
    setIsVerifying(true);
    try {
      await verifyCustomerOtp(
        mobileNumber,
        otp,
        purpose,
        role === 'seller' ? 'SELLER' : 'CUSTOMER',
      );
    } catch (error) {
      setOtpError(customerAuthErrorMessage(error, 'Invalid OTP. Please try again.'));
      setIsVerifying(false);
      return;
    }

    const previousMobile = useAuthStore.getState().mobileNumber;
    if (previousMobile && previousMobile !== mobileNumber) resetUserScopedState();
    completeLogin(mobileNumber);
    if (role === 'customer') {
      await refreshKycStatus();
    }
    setIsVerifying(false);

    const { kycApproved, reviewSubmitted } = useAuthStore.getState();
    router.replace(getLoggedInRoute({ kycApproved, reviewSubmitted }));
  }, [completeLogin, isOtpComplete, isVerifying, otp, params.phone, purpose, router]);

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
            void handleVerify();
          }}
        />
        <Typography variant="legal" className="mt-lg px-md">
          Secure multi-factor authentication for authorized PetroTrade personnel only.
        </Typography>
      </View>
    </ScreenWrapper>
  );
};

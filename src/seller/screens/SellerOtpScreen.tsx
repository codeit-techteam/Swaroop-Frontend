import { useCallback, useEffect, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { AuthCard, FooterLinks, OtpInput, ScreenWrapper, Typography } from '@/components';
import { SellerHeader, SellerPrimaryButton } from '@/seller/components';
import { SELLER_DEMO_OTP, SELLER_RESEND_SECONDS } from '@/seller/constants';
import { verifySellerOtp } from '@/seller/mock/mockSellerService';
import { getSellerInitialRoute } from '@/seller/navigation/getSellerInitialRoute';
import { useSellerStore } from '@/seller/store/sellerStore';

const formatTimer = (seconds: number): string => `00:${seconds.toString().padStart(2, '0')}`;

export const SellerOtpScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ mobile?: string }>();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(SELLER_RESEND_SECONDS);
  const setMobile = useSellerStore((state) => state.setMobile);
  const markOtpVerified = useSellerStore((state) => state.markOtpVerified);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      setSecondsLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = useCallback(() => {
    const mobile = params.mobile ?? '';
    if (!verifySellerOtp(mobile, otp)) {
      setOtpError(`Use ${SELLER_DEMO_OTP} for the frontend demo.`);
      return;
    }

    setMobile(mobile);
    markOtpVerified();
    router.replace(getSellerInitialRoute(useSellerStore.getState()) as Href);
  }, [markOtpVerified, otp, params.mobile, router, setMobile]);

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
            if (secondsLeft === 0) {
              setOtp('');
              setOtpError(undefined);
              setSecondsLeft(SELLER_RESEND_SECONDS);
            }
          }}
          className="mt-sm self-center"
        >
          <Typography
            variant="link"
            className={secondsLeft === 0 ? 'text-brand-primary' : 'text-brand-muted'}
          >
            Resend OTP
          </Typography>
        </Pressable>

        <SellerPrimaryButton
          label="Verify & Continue"
          className="mt-xl"
          disabled={otp.length !== 6}
          onPress={handleVerify}
        />

        <View className="mt-lg rounded-2xl bg-brand-surface p-md">
          <Typography variant="legal" className="text-left">
            Static OTP for demo: {SELLER_DEMO_OTP}
          </Typography>
        </View>
      </AuthCard>

      <FooterLinks className="mt-2xl" />
    </ScreenWrapper>
  );
};

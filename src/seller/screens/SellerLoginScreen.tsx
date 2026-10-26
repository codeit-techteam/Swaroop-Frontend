import { useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { Controller } from 'react-hook-form';
import { z } from 'zod';

import {
  AppLogo,
  AuthCard,
  CountryPicker,
  FooterLinks,
  ScreenWrapper,
  Typography,
} from '@/components';
import { DEMO_PHONE, DEVELOPMENT_MODE } from '@/config/development';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import { SellerHeader, SellerPrimaryButton, SellerTextField } from '@/seller/components';
import { useSellerStore } from '@/seller/store/sellerStore';
import { openContactSupport } from '@/services/legal-links';
import { requestSellerOtpSend } from '@/services/seller-auth';
import {
  indianMobileFieldError,
  isCompleteIndianMobile,
  sanitizeIndianMobileInput,
} from '@/utils/phone-input';

const sellerLoginSchema = z.object({
  mobile: z
    .string()
    .transform(sanitizeIndianMobileInput)
    .refine(isCompleteIndianMobile, 'Enter a valid 10-digit Indian mobile number'),
});

type SellerLoginValues = z.infer<typeof sellerLoginSchema>;

export const SellerLoginScreen = () => {
  const router = useRouter();
  const setMobile = useSellerStore((state) => state.setMobile);
  const [isSending, setIsSending] = useState(false);
  const [hint, setHint] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
  } = useZodForm(sellerLoginSchema, {
    defaultValues: { mobile: '' },
    mode: 'onChange',
  });

  const mobileValue = watch('mobile');

  const handleGetOtp = useCallback(
    async (values: SellerLoginValues) => {
      setSubmitted(true);
      setMobile(values.mobile);
      setIsSending(true);
      setHint(undefined);
      try {
        const result = await requestSellerOtpSend(values.mobile);
        if (result.message) {
          setHint(result.message);
        }
        if (!result.ok) {
          return;
        }

        router.push({
          pathname: ROUTES.SELLER.OTP,
          params: { mobile: values.mobile },
        } as unknown as Href);
      } finally {
        setIsSending(false);
      }
    },
    [router, setMobile],
  );

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader showBack title="Seller Login" onBack={() => router.back()} />

      <View className="py-lg">
        <AppLogo className="self-start" />
      </View>

      <AuthCard className="rounded-2xl">
        <View className="mb-lg flex-row items-center gap-xs self-start rounded-full bg-brand-badge px-md py-sm">
          <Typography variant="badge">SECURE ENTERPRISE LOGIN</Typography>
        </View>

        <Typography variant="headingLeft">Seller Login</Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Enter your registered mobile number to continue to the seller console.
        </Typography>

        <Controller
          control={control}
          name="mobile"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <SellerTextField
              label="Mobile Number"
              placeholder="98765 43210"
              keyboardType="number-pad"
              maxLength={10}
              value={value}
              onChangeText={(text) => {
                onChange(sanitizeIndianMobileInput(text));
                setHint(undefined);
              }}
              onBlur={onBlur}
              error={
                fieldState.error?.message ??
                indianMobileFieldError(value, {
                  touched: fieldState.isTouched,
                  submitted,
                }) ??
                hint
              }
              leftSlot={<CountryPicker />}
              containerClassName="mt-xl"
            />
          )}
        />

        <SellerPrimaryButton
          label={isSending ? 'Sending…' : 'GET OTP'}
          showArrow
          className="mt-xl"
          disabled={isSending}
          onPress={() => {
            if (!mobileValue?.trim()) {
              setSubmitted(true);
              setHint('Enter your 10-digit mobile number.');
              return;
            }
            void handleSubmit((values) => {
              void handleGetOtp(values);
            })();
          }}
        />

        {DEVELOPMENT_MODE ? (
          <View className="mt-xl rounded-2xl bg-brand-surface p-md">
            <Typography variant="legal" className="text-left">
              Dev only demo mobile: {DEMO_PHONE}
            </Typography>
          </View>
        ) : null}

        <Pressable
          className="mt-xl rounded-2xl border border-brand-border px-lg py-md"
          accessibilityRole="link"
          onPress={() => {
            void openContactSupport();
          }}
        >
          <Typography variant="body" className="text-center">
            Contact Support
          </Typography>
        </Pressable>
      </AuthCard>

      <Typography variant="headingLeft" className="mt-2xl">
        Welcome Seller
      </Typography>
      <Typography variant="subheadingLeft" className="mt-sm">
        Access your seller dashboard, inventory, orders and enterprise operations from one place.
      </Typography>

      <FooterLinks className="mt-2xl" />
    </ScreenWrapper>
  );
};

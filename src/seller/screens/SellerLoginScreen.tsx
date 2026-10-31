import { useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { Controller } from 'react-hook-form';
import { z } from 'zod';

import {
  AppLogo,
  AuthCard,
  CountryPicker,
  Divider,
  FooterLinks,
  PrimaryButton,
  ScreenWrapper,
  SecondaryButton,
  Typography,
} from '@/components';
import { DEMO_PHONE } from '@/config/development';
import { BackArrowIcon } from '@/icons';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import { SellerTextField } from '@/seller/components';
import { useSellerStore } from '@/seller/store/sellerStore';
import { openContactSupport } from '@/services/legal-links';
import { requestSellerOtpSend } from '@/services/seller-auth';
import {
  EMPTY_MOBILE_MESSAGE,
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
  const [editingMobile, setEditingMobile] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
  } = useZodForm(sellerLoginSchema, {
    defaultValues: { mobile: '' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const mobileValue = watch('mobile');

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
  }, [router]);

  const handleGetOtp = useCallback(
    async (values: SellerLoginValues) => {
      setSubmitted(true);
      setMobile(values.mobile);
      setIsSending(true);
      setHint(undefined);
      try {
        const result = await requestSellerOtpSend(values.mobile, 'LOGIN');
        if (result.message) {
          setHint(result.message);
        }
        if (!result.ok) {
          return;
        }

        router.push({
          pathname: ROUTES.SELLER.OTP,
          params: { mobile: values.mobile, source: 'login' },
        } as unknown as Href);
      } finally {
        setIsSending(false);
      }
    },
    [router, setMobile],
  );

  const handleSignUp = useCallback(() => {
    router.push(ROUTES.SELLER.REGISTER as Href);
  }, [router]);

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <View className="flex-1 justify-center py-xl">
        <View className="mb-md flex-row items-center">
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon />
          </Pressable>
        </View>

        <AuthCard>
          <AppLogo className="mb-xl" />

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
                  const next = sanitizeIndianMobileInput(text);
                  setEditingMobile(true);
                  onChange(next);
                  clearErrors('mobile');
                  setHint(undefined);
                  if (!next) {
                    setSubmitted(false);
                  }
                }}
                onBlur={() => {
                  setEditingMobile(false);
                  onBlur();
                }}
                error={
                  indianMobileFieldError(value, {
                    touched: fieldState.isTouched,
                    submitted,
                    editing: editingMobile,
                  }) ?? (editingMobile ? undefined : hint)
                }
                leftSlot={<CountryPicker />}
                containerClassName="mt-xl"
              />
            )}
          />

          <PrimaryButton
            label={isSending ? 'Sending…' : 'GET OTP'}
            showArrow
            className="mt-xl"
            disabled={isSending}
            loading={isSending}
            onPress={() => {
              setEditingMobile(false);
              // Keep pressable when empty so sellers get the same L-06 empty-field message.
              if (!isCompleteIndianMobile(mobileValue ?? '')) {
                setSubmitted(true);
                setHint(
                  indianMobileFieldError(mobileValue ?? '', { submitted: true }) ??
                    EMPTY_MOBILE_MESSAGE,
                );
                return;
              }
              void handleSubmit((values) => {
                void handleGetOtp(values);
              })();
            }}
          />

          {__DEV__ ? (
            <View className="mt-xl rounded-md bg-brand-surface p-md">
              <Typography variant="legal" className="text-left">
                Dev only demo mobile: {DEMO_PHONE}
              </Typography>
            </View>
          ) : null}

          <Divider className="my-xl" />

          <SecondaryButton label="Sign Up" onPress={handleSignUp} />

          <SecondaryButton
            label="Contact Support"
            variant="outline"
            className="mt-md"
            onPress={() => {
              void openContactSupport({ topic: 'SELL_MATERIALS' });
            }}
          />
        </AuthCard>

        <Typography variant="headingLeft" className="mt-2xl">
          Welcome Seller
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Access your seller dashboard, inventory, orders and enterprise operations from one place.
        </Typography>

        <FooterLinks className="mt-2xl" />
      </View>
    </ScreenWrapper>
  );
};

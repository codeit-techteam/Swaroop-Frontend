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
import { DEMO_PHONE } from '@/config/development';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import { SellerPrimaryButton, SellerTextField } from '@/seller/components';
import { getSellerInitialRoute } from '@/seller/navigation/getSellerInitialRoute';
import { useSellerStore } from '@/seller/store/sellerStore';
import { requestSellerOtpSend } from '@/services/seller-auth';
import { phoneSchema } from '@/utils/validators';

const sellerLoginSchema = z.object({
  mobile: phoneSchema,
});

type SellerLoginValues = z.infer<typeof sellerLoginSchema>;

export const SellerLoginScreen = () => {
  const router = useRouter();
  const snapshot = useSellerStore((state) => state);
  const setMobile = useSellerStore((state) => state.setMobile);
  const [isSending, setIsSending] = useState(false);
  const [hint, setHint] = useState<string | undefined>();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useZodForm(sellerLoginSchema, {
    defaultValues: { mobile: snapshot.mobile || DEMO_PHONE },
    mode: 'onChange',
  });

  const handleGetOtp = useCallback(
    async (values: SellerLoginValues) => {
      setMobile(values.mobile);
      setIsSending(true);
      setHint(undefined);
      try {
        // Skip OTP for repeat demo sessions that already have dashboard access.
        if (
          values.mobile === DEMO_PHONE &&
          snapshot.sellerLoggedIn &&
          snapshot.dashboardAccess
        ) {
          router.replace(getSellerInitialRoute(useSellerStore.getState()) as Href);
          return;
        }

        const result = await requestSellerOtpSend(values.mobile);
        if (result.message) {
          setHint(result.message);
        }

        router.push({
          pathname: ROUTES.SELLER.OTP,
          params: { mobile: values.mobile },
        } as unknown as Href);
      } finally {
        setIsSending(false);
      }
    },
    [router, setMobile, snapshot.dashboardAccess, snapshot.sellerLoggedIn],
  );

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <View className="py-lg">
        <AppLogo className="self-start" />
      </View>

      <AuthCard className="rounded-2xl">
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
              keyboardType="phone-pad"
              maxLength={10}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              leftSlot={<CountryPicker />}
              containerClassName="mt-xl"
            />
          )}
        />

        {hint ? (
          <Typography variant="legal" className="mt-sm text-left text-brand-muted">
            {hint}
          </Typography>
        ) : null}

        <SellerPrimaryButton
          label={isSending ? 'Sending…' : 'Get OTP'}
          showArrow
          className="mt-xl"
          disabled={!isValid || isSending}
          onPress={handleSubmit((values) => {
            void handleGetOtp(values);
          })}
        />

        <View className="mt-xl rounded-2xl bg-brand-surface p-md">
          <Typography variant="legal" className="text-left">
            Demo mobile: {DEMO_PHONE}
          </Typography>
        </View>

        <Pressable className="mt-xl rounded-2xl border border-brand-border px-lg py-md">
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

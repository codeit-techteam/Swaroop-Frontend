import { useCallback } from 'react';

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
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import { SellerPrimaryButton, SellerTextField } from '@/seller/components';
import { SELLER_DEMO_MOBILE } from '@/seller/constants';
import { requestSellerOtp } from '@/seller/mock/mockSellerService';
import { getSellerInitialRoute } from '@/seller/navigation/getSellerInitialRoute';
import { useSellerStore } from '@/seller/store/sellerStore';
import { phoneSchema } from '@/utils/validators';

const sellerLoginSchema = z.object({
  mobile: phoneSchema,
});

type SellerLoginValues = z.infer<typeof sellerLoginSchema>;

export const SellerLoginScreen = () => {
  const router = useRouter();
  const snapshot = useSellerStore((state) => state);
  const setMobile = useSellerStore((state) => state.setMobile);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useZodForm(sellerLoginSchema, {
    defaultValues: { mobile: snapshot.mobile || SELLER_DEMO_MOBILE },
    mode: 'onChange',
  });

  const handleGetOtp = useCallback(
    (values: SellerLoginValues) => {
      setMobile(values.mobile);
      const { requiresOtp } = requestSellerOtp(values.mobile);

      if (!requiresOtp) {
        router.replace(getSellerInitialRoute(useSellerStore.getState()) as Href);
        return;
      }

      router.push({
        pathname: ROUTES.SELLER.OTP,
        params: { mobile: values.mobile },
      } as unknown as Href);
    },
    [router, setMobile],
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

        <SellerPrimaryButton
          label="Get OTP"
          showArrow
          className="mt-xl"
          disabled={!isValid}
          onPress={handleSubmit(handleGetOtp)}
        />

        <View className="mt-xl rounded-2xl bg-brand-surface p-md">
          <Typography variant="legal" className="text-left">
            Demo mobile: {SELLER_DEMO_MOBILE}
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

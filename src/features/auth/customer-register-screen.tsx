import { useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { Controller } from 'react-hook-form';
import { z } from 'zod';

import { CountryPicker, InputField, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { LockIcon, PetroTradeLogo } from '@/icons';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import { gstSchema, phoneSchema, requiredString } from '@/utils/validators';

const registerSchema = z.object({
  fullName: requiredString('Full name'),
  companyName: requiredString('Company name'),
  mobile: phoneSchema,
  gstNumber: gstSchema,
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const CustomerRegisterScreen = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useZodForm(registerSchema, {
    defaultValues: {
      fullName: '',
      companyName: '',
      mobile: '',
      gstNumber: '',
    },
    mode: 'onChange',
  });

  const onRegister = useCallback(
    (values: RegisterFormValues) => {
      router.push({
        pathname: ROUTES.AUTH.OTP_VERIFICATION,
        params: { phone: values.mobile, source: 'register' },
      } as unknown as Href);
    },
    [router],
  );

  const onLogin = useCallback(() => {
    router.replace(ROUTES.AUTH.CUSTOMER_LOGIN as Href);
  }, [router]);

  return (
    <ScreenWrapper scrollable className="bg-brand-white">
      <View className="items-center pt-lg">
        <PetroTradeLogo size={48} />
        <Typography variant="logo" className="mt-md">
          PetroTrade
        </Typography>
        <Typography variant="subheading" className="mt-xs">
          Create an Enterprise Account
        </Typography>
      </View>

      <View className="mt-2xl gap-lg">
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <InputField
              label="Company Name"
              placeholder="Enter legal entity name"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="mobile"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <InputField
              label="Mobile Number"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              leftSlot={<CountryPicker />}
            />
          )}
        />

        <Controller
          control={control}
          name="gstNumber"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <InputField
              label="GST Number"
              placeholder="22AAAAA0000A1Z5"
              autoCapitalize="characters"
              value={value}
              onChangeText={(text) => onChange(text.toUpperCase())}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>

      <PrimaryButton
        label="Register & Continue"
        className="mt-2xl"
        disabled={!isValid}
        onPress={handleSubmit(onRegister)}
      />

      <View className="mt-lg flex-row items-center justify-center gap-xs">
        <LockIcon />
        <Typography variant="success">Secure 256-bit encrypted registration</Typography>
      </View>

      <View className="mt-xl items-center">
        <View className="flex-row items-center">
          <Typography variant="legal">Already have an account? </Typography>
          <Pressable onPress={onLogin} accessibilityRole="link">
            <Typography variant="link">Login</Typography>
          </Pressable>
        </View>
        <Typography variant="legal" className="mt-md px-md">
          By registering, you agree to our{' '}
          <Typography variant="legal" className="underline">
            Terms of Service
          </Typography>{' '}
          and{' '}
          <Typography variant="legal" className="underline">
            Privacy Policy
          </Typography>
          .
        </Typography>
      </View>
    </ScreenWrapper>
  );
};

import { useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { Controller } from 'react-hook-form';
import { z } from 'zod';

import { CountryPicker, InputField, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { LockIcon, PolyStoreXLogo } from '@/icons';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import {
  customerAuthErrorMessage,
  isOtpCooldownError,
  sendCustomerOtp,
} from '@/services/customer-auth';
import { openPrivacyPolicy, openTermsOfService } from '@/services/legal-links';
import {
  indianMobileFieldError,
  isCompleteIndianMobile,
  sanitizeIndianMobileInput,
} from '@/utils/phone-input';
import { gstSchema, requiredString } from '@/utils/validators';

const registerSchema = z.object({
  fullName: requiredString('Full name'),
  companyName: requiredString('Company name'),
  mobile: z
    .string()
    .transform(sanitizeIndianMobileInput)
    .refine(isCompleteIndianMobile, 'Enter a valid 10-digit Indian mobile number'),
  gstNumber: gstSchema,
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const CustomerRegisterScreen = () => {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>();
  const [editingMobile, setEditingMobile] = useState(false);
  const [mobileSubmitted, setMobileSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
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

  const mobileValue = watch('mobile');
  const mobileReady = isCompleteIndianMobile(mobileValue ?? '');

  const onRegister = useCallback(
    async (values: RegisterFormValues) => {
      setIsSending(true);
      setSendError(undefined);
      try {
        await sendCustomerOtp(values.mobile, 'SIGNUP');
      } catch (error) {
        if (!isOtpCooldownError(error)) {
          setSendError(customerAuthErrorMessage(error, 'Unable to send OTP. Please try again.'));
          return;
        }
      } finally {
        setIsSending(false);
      }
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
        <PolyStoreXLogo size={48} />
        <Typography variant="logo" className="mt-md">
          PolyStoreX
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
              keyboardType="number-pad"
              maxLength={10}
              value={value}
              onChangeText={(text) => {
                const next = sanitizeIndianMobileInput(text);
                setEditingMobile(true);
                onChange(next);
                clearErrors('mobile');
                setSendError(undefined);
                if (!next) {
                  setMobileSubmitted(false);
                }
              }}
              onBlur={() => {
                setEditingMobile(false);
                onBlur();
              }}
              error={
                indianMobileFieldError(value, {
                  touched: fieldState.isTouched,
                  submitted: mobileSubmitted,
                  editing: editingMobile,
                }) ?? (editingMobile ? undefined : sendError)
              }
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
        disabled={!isValid || !mobileReady || isSending}
        loading={isSending}
        onPress={() => {
          setEditingMobile(false);
          setMobileSubmitted(true);
          void handleSubmit(onRegister)();
        }}
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
        <Typography variant="legal" className="mt-md px-md text-center">
          By registering, you agree to our{' '}
          <Typography
            variant="link"
            className="underline"
            onPress={() => {
              void openTermsOfService();
            }}
          >
            Terms of Service
          </Typography>{' '}
          and{' '}
          <Typography
            variant="link"
            className="underline"
            onPress={() => {
              void openPrivacyPolicy();
            }}
          >
            Privacy Policy
          </Typography>
          .
        </Typography>
      </View>
    </ScreenWrapper>
  );
};

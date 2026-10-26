import { useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { Controller } from 'react-hook-form';
import { z } from 'zod';

import {
  AppLogo,
  AuthCard,
  CountryPicker,
  Divider,
  FooterLinks,
  InputField,
  PrimaryButton,
  ScreenWrapper,
  SecondaryButton,
  Typography,
} from '@/components';
import { DEVELOPMENT_MODE, DEMO_PHONE, DEMO_OTP, DEMO_USER_NAME } from '@/config/development';
import { LockIcon } from '@/icons';
import { useZodForm } from '@/lib/forms';
import { parseReturnToParam } from '@/navigation/return-to';
import { ROUTES } from '@/navigation/routes';
import {
  customerAuthErrorMessage,
  isOtpCooldownError,
  sendCustomerOtp,
} from '@/services/customer-auth';
import { openContactSupport } from '@/services/legal-links';
import { brandColors } from '@/theme/colors';
import {
  indianMobileFieldError,
  isCompleteIndianMobile,
  sanitizeIndianMobileInput,
} from '@/utils/phone-input';

const loginSchema = z.object({
  mobile: z
    .string()
    .transform(sanitizeIndianMobileInput)
    .refine(isCompleteIndianMobile, 'Enter a valid 10-digit Indian mobile number'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const CustomerLoginScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const returnTo = parseReturnToParam(params.returnTo);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
  } = useZodForm(loginSchema, {
    defaultValues: { mobile: '' },
    mode: 'onChange',
  });

  const mobileValue = watch('mobile');

  const onGetOtp = useCallback(
    async (values: LoginFormValues) => {
      setSubmitted(true);
      if (!isCompleteIndianMobile(values.mobile)) {
        setSendError('Enter your 10-digit mobile number.');
        return;
      }
      setIsSending(true);
      setSendError(undefined);
      try {
        await sendCustomerOtp(values.mobile, 'LOGIN');
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
        params: {
          phone: values.mobile,
          source: 'login',
          ...(returnTo ? { returnTo } : {}),
        },
      } as unknown as Href);
    },
    [returnTo, router],
  );

  const onEmptyGetOtp = useCallback(() => {
    setSubmitted(true);
    setSendError('Enter your 10-digit mobile number.');
  }, []);

  const onSignUp = useCallback(() => {
    router.push({
      pathname: ROUTES.AUTH.CUSTOMER_REGISTER,
      params: returnTo ? { returnTo } : {},
    } as unknown as Href);
  }, [returnTo, router]);

  const onBrowseMarket = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <View className="flex-1 justify-center py-xl">
        <AuthCard>
          <AppLogo className="mb-xl" />

          <View className="mb-lg flex-row items-center gap-xs self-start rounded-full bg-brand-badge px-md py-sm">
            <LockIcon color={brandColors.badgeText} />

            <Typography variant="badge">SECURE ENTERPRISE LOGIN</Typography>
          </View>

          <Typography variant="headingLeft">Welcome Back</Typography>
          <Typography variant="subheadingLeft" className="mb-xl mt-sm">
            Enter your mobile number to access your account.
          </Typography>

          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, onBlur, value }, fieldState }) => {
              const liveError =
                fieldState.error?.message ??
                indianMobileFieldError(value, {
                  touched: fieldState.isTouched,
                  submitted,
                }) ??
                sendError;
              return (
                <InputField
                  label="Mobile Number"
                  placeholder="98765 43210"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={value}
                  onChangeText={(text) => {
                    onChange(sanitizeIndianMobileInput(text));
                    setSendError(undefined);
                  }}
                  onBlur={onBlur}
                  error={liveError}
                  leftSlot={<CountryPicker />}
                />
              );
            }}
          />

          <PrimaryButton
            label="GET OTP"
            className="mt-xl"
            disabled={isSending}
            loading={isSending}
            onPress={() => {
              if (!mobileValue?.trim()) {
                onEmptyGetOtp();
                return;
              }
              void handleSubmit(onGetOtp)();
            }}
          />

          {DEVELOPMENT_MODE ? (
            <Typography variant="legal" className="mt-md text-center">
              Dev only: {DEMO_USER_NAME} · {DEMO_PHONE} · OTP {DEMO_OTP}
            </Typography>
          ) : null}

          <Divider className="my-xl" />

          <SecondaryButton label="Sign Up" onPress={onSignUp} />

          <SecondaryButton
            label="Browse marketplace"
            variant="outline"
            className="mt-md"
            onPress={onBrowseMarket}
          />

          <View className="mt-xl items-center gap-sm">
            <View className="flex-row items-center gap-xs">
              <LockIcon />
              <Typography variant="success">Secure login for registered buyers</Typography>
            </View>
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                void openContactSupport();
              }}
            >
              <Typography variant="link">Having trouble? Contact Support</Typography>
            </Pressable>
          </View>
        </AuthCard>

        <FooterLinks className="mt-2xl" />
      </View>
    </ScreenWrapper>
  );
};

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
import { DEMO_PHONE, DEMO_OTP, DEMO_USER_NAME } from '@/config/development';
import { BackArrowIcon, LockIcon } from '@/icons';
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
  EMPTY_MOBILE_MESSAGE,
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
  const [editingMobile, setEditingMobile] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
  } = useZodForm(loginSchema, {
    defaultValues: { mobile: '' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const mobileValue = watch('mobile');

  const onGetOtp = useCallback(
    async (values: LoginFormValues) => {
      setSubmitted(true);
      if (!isCompleteIndianMobile(values.mobile)) {
        setSendError(
          indianMobileFieldError(values.mobile, { submitted: true }) ?? EMPTY_MOBILE_MESSAGE,
        );
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

  const onInvalidGetOtp = useCallback(() => {
    setSubmitted(true);
    setEditingMobile(false);
    setSendError(
      indianMobileFieldError(mobileValue ?? '', { submitted: true }) ?? EMPTY_MOBILE_MESSAGE,
    );
  }, [mobileValue]);

  const onSignUp = useCallback(() => {
    router.push({
      pathname: ROUTES.AUTH.CUSTOMER_REGISTER,
      params: returnTo ? { returnTo } : {},
    } as unknown as Href);
  }, [returnTo, router]);

  const onBrowseMarket = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
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
                indianMobileFieldError(value, {
                  touched: fieldState.isTouched,
                  submitted,
                  editing: editingMobile,
                }) ??
                (editingMobile ? undefined : sendError);
              return (
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
                      setSubmitted(false);
                    }
                  }}
                  onBlur={() => {
                    setEditingMobile(false);
                    onBlur();
                  }}
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
              setEditingMobile(false);
              // Keep the button pressable when empty/incomplete so L-06 shows a clear message.
              if (!isCompleteIndianMobile(mobileValue ?? '')) {
                onInvalidGetOtp();
                return;
              }
              void handleSubmit(onGetOtp)();
            }}
          />

          {__DEV__ ? (
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
              <Typography variant="success">Secure login for registered businesses</Typography>
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

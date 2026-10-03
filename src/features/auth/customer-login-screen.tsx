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
  InputField,
  PrimaryButton,
  ScreenWrapper,
  SecondaryButton,
  Typography,
} from '@/components';
import { DEMO_PHONE, DEMO_OTP, DEMO_USER_NAME, DEVELOPMENT_MODE } from '@/config/development';
import { LockIcon } from '@/icons';
import { useZodForm } from '@/lib/forms';
import { ROUTES } from '@/navigation/routes';
import {
  customerAuthErrorMessage,
  isOtpCooldownError,
  sendCustomerOtp,
} from '@/services/customer-auth';
import { brandColors } from '@/theme/colors';
import { phoneSchema } from '@/utils/validators';

const loginSchema = z.object({
  mobile: phoneSchema,
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const CustomerLoginScreen = () => {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useZodForm(loginSchema, {
    defaultValues: { mobile: DEVELOPMENT_MODE ? DEMO_PHONE : '' },
    mode: 'onChange',
  });

  const onGetOtp = useCallback(
    async (values: LoginFormValues) => {
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
        params: { phone: values.mobile, source: 'login' },
      } as unknown as Href);
    },
    [router],
  );

  const onSignUp = useCallback(() => {
    router.push(ROUTES.AUTH.CUSTOMER_REGISTER as Href);
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
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <InputField
                label="Mobile Number"
                placeholder="98765 43210"
                keyboardType="phone-pad"
                maxLength={10}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message ?? sendError}
                leftSlot={<CountryPicker />}
              />
            )}
          />

          <PrimaryButton
            label="GET OTP"
            className="mt-xl"
            disabled={!isValid}
            loading={isSending}
            onPress={handleSubmit(onGetOtp)}
          />

          {DEVELOPMENT_MODE ? (
            <Typography variant="legal" className="mt-md text-center">
              Dev: {DEMO_USER_NAME} · {DEMO_PHONE} · OTP {DEMO_OTP}
            </Typography>
          ) : null}

          <Divider className="my-xl" />

          <SecondaryButton label="Sign Up" onPress={onSignUp} />

          <View className="mt-xl items-center gap-sm">
            <View className="flex-row items-center gap-xs">
              <LockIcon />
              <Typography variant="success">Authorized Personnel Only</Typography>
            </View>
            <Pressable accessibilityRole="link">
              <Typography variant="link">Having trouble? Contact Support</Typography>
            </Pressable>
          </View>
        </AuthCard>

        <FooterLinks className="mt-2xl" />
      </View>
    </ScreenWrapper>
  );
};

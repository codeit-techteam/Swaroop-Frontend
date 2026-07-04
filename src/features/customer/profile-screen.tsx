import { memo, useCallback } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { ProfileIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectMobileNumber, useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';

export const CustomerProfileScreen = memo(function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mobileNumber = useAuthStore(selectMobileNumber);
  const logout = useAuthStore((state) => state.logout);
  const resetDemoAccount = useAuthStore((state) => state.resetDemoAccount);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
  }, [logout, router]);

  const handleResetDemoAccount = useCallback(async () => {
    await resetDemoAccount();
    Toast.show({
      type: 'success',
      text1: 'Demo account reset',
      text2: 'Onboarding will start fresh.',
      visibilityTime: 2000,
    });
    router.replace(ROUTES.AUTH.CUSTOMER_LOGIN as Href);
  }, [resetDemoAccount, router]);

  return (
    <View className="flex-1 bg-brand-white px-lg" style={{ paddingTop: insets.top + 16 }}>
      <Typography variant="headingLeft" className="text-[22px] text-brand-primary">
        Profile
      </Typography>
      <Typography variant="subheadingLeft" className="mt-sm">
        Manage your buyer account, delivery addresses, and business preferences.
      </Typography>

      <View className="mt-2xl items-center rounded-xl border border-brand-border bg-brand-primary-tint px-lg py-2xl">
        <ProfileIcon color={brandColors.primary} />
        <Typography variant="roleTitle" className="mt-md text-brand-heading">
          Buyer Account
        </Typography>
        <Typography variant="subheading" className="mt-sm px-md">
          {mobileNumber
            ? `Signed in as +91 ${mobileNumber}`
            : 'Default delivery location is Mumbai, MH 400001. Update addresses anytime.'}
        </Typography>
      </View>

      <PrimaryButton label="Logout" className="mt-2xl" onPress={() => void handleLogout()} />

      {__DEV__ ? (
        <View className="mt-xl rounded-xl border border-dashed border-brand-border px-md py-lg">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            Developer Settings
          </Typography>
          <Typography
            variant="caption"
            className="mt-xs font-sans normal-case tracking-normal text-brand-muted"
          >
            Visible only in development builds. Clears all local demo data.
          </Typography>
          <SecondaryButton
            label="Reset Demo Account"
            variant="outline"
            className="mt-md"
            onPress={() => void handleResetDemoAccount()}
          />
        </View>
      ) : null}
    </View>
  );
});

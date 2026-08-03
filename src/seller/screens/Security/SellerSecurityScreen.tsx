import { memo, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { LockIcon, ShieldCheckIcon } from '@/icons';
import {
  DashboardSkeleton,
  SellerHeader,
  SessionCard,
  SettingsAction,
  SettingsGroup,
  SettingsToggle,
  StatusBottomSheet,
  TrustedDeviceCard,
} from '@/seller/components';
import { useSellerSecurity } from '@/seller/hooks/useSellerSecurity';
import { brandColors } from '@/theme/colors';

export const SellerSecurityScreen = memo(function SellerSecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { snapshot, isLoading, updateSetting, handleLogoutAll } = useSellerSecurity();
  const [logoutSheet, setLogoutSheet] = useState(false);
  const [successSheet, setSuccessSheet] = useState(false);

  const confirmLogoutAll = async () => {
    setLogoutSheet(false);
    await handleLogoutAll();
    setSuccessSheet(true);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Security"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {isLoading ? (
          <View className="mt-lg">
            <DashboardSkeleton />
          </View>
        ) : (
          <>
            <View className="mt-md flex-row gap-md">
              <Pressable
                onPress={() => undefined}
                className="flex-1 rounded-[22px] border border-brand-border bg-brand-white p-lg"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light">
                  <LockIcon size={20} color={brandColors.primaryDark} />
                </View>
                <Typography variant="roleTitle" className="mt-md">
                  Change Password
                </Typography>
                <Typography variant="legal" className="mt-xs text-brand-body">
                  Update your account password
                </Typography>
              </Pressable>
              <Pressable
                onPress={() => updateSetting({ twoFactorEnabled: !snapshot.settings.twoFactorEnabled })}
                className="flex-1 rounded-[22px] border border-brand-border bg-brand-white p-lg"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light">
                  <ShieldCheckIcon size={20} color={brandColors.primaryDark} />
                </View>
                <Typography variant="roleTitle" className="mt-md">
                  Enable 2FA
                </Typography>
                <Typography variant="legal" className="mt-xs text-brand-body">
                  {snapshot.settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Typography>
              </Pressable>
            </View>

            <SettingsGroup title="Authentication">
              <SettingsToggle
                label="Enable Biometric"
                description="Use fingerprint or face ID"
                value={snapshot.settings.biometricEnabled}
                onValueChange={(v) => updateSetting({ biometricEnabled: v })}
              />
              <SettingsToggle
                label="Enable 2FA"
                description="Require OTP for login"
                value={snapshot.settings.twoFactorEnabled}
                onValueChange={(v) => updateSetting({ twoFactorEnabled: v })}
              />
              <SettingsAction
                label="Change PIN"
                description={snapshot.settings.pinSet ? 'PIN is set' : 'Set up a PIN'}
                onPress={() => undefined}
                isLast
              />
            </SettingsGroup>

            <View className="mt-lg">
              <Typography variant="badge" className="mb-sm text-[11px] uppercase tracking-wide text-brand-body">
                Trusted Devices
              </Typography>
              <View className="gap-sm">
                {snapshot.trustedDevices.map((device) => (
                  <TrustedDeviceCard key={device.id} device={device} />
                ))}
              </View>
            </View>

            <View className="mt-lg">
              <Typography variant="badge" className="mb-sm text-[11px] uppercase tracking-wide text-brand-body">
                Active Sessions
              </Typography>
              <View className="gap-sm">
                {snapshot.activeSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </View>
            </View>

            <View className="mt-xl">
              <SettingsGroup title="">
                <SettingsAction
                  label="Logout All Devices"
                  description="Sign out from all active sessions"
                  onPress={() => setLogoutSheet(true)}
                  destructive
                  isLast
                />
              </SettingsGroup>
            </View>
          </>
        )}
      </ScrollView>

      <StatusBottomSheet
        visible={logoutSheet}
        variant="error"
        title="Logout All Devices?"
        message="This will sign you out from all devices except the current one. You will need to sign in again on other devices."
        primaryLabel="Logout All"
        secondaryLabel="Cancel"
        onPrimary={() => void confirmLogoutAll()}
        onDismiss={() => setLogoutSheet(false)}
      />

      <StatusBottomSheet
        visible={successSheet}
        variant="success"
        title="Sessions Revoked"
        message="All other devices have been signed out successfully."
        onDismiss={() => setSuccessSheet(false)}
      />
    </ScreenWrapper>
  );
});

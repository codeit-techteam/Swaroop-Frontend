import { memo, useState } from 'react';

import { Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  DashboardSkeleton,
  OfflineBanner,
  SellerBottomNavigation,
  SellerHeader,
  SettingsAction,
  SettingsGroup,
  SettingsInfo,
  SettingsSelect,
  SettingsToggle,
  StatusBottomSheet,
} from '@/seller/components';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSellerOffline } from '@/seller/hooks/useSellerOffline';
import { useSellerSettings } from '@/seller/hooks/useSellerSettings';
import { useSkeletonLoading } from '@/seller/hooks/useSkeletonLoading';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
  THEME_OPTIONS,
} from '@/seller/mock/settings';
import type { CurrencyOption, DateFormatOption, LanguageOption, ThemeMode } from '@/seller/types/settings';

type PickerState = {
  visible: boolean;
  field: 'language' | 'theme' | 'currency' | 'dateFormat' | 'sessionTimeout' | null;
};

export const SellerAppSettingsScreen = memo(function SellerAppSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isOffline = useSellerOffline();
  const isLoading = useSkeletonLoading();
  const { settings, appVersion, updateSetting, clearCache } = useSellerSettings();
  const [picker, setPicker] = useState<PickerState>({ visible: false, field: null });
  const [statusSheet, setStatusSheet] = useState<{ visible: boolean; success: boolean; message: string }>({
    visible: false,
    success: true,
    message: '',
  });

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    // mock reload settings from storage
  });

  const openPicker = (field: PickerState['field']) => setPicker({ visible: true, field });

  const handleClearCache = async () => {
    try {
      await clearCache();
      setStatusSheet({ visible: true, success: true, message: 'Cache cleared successfully.' });
    } catch {
      setStatusSheet({ visible: true, success: false, message: 'Failed to clear cache.' });
    }
  };

  const getPickerOptions = () => {
    switch (picker.field) {
      case 'language':
        return LANGUAGE_OPTIONS.map((o) => ({ label: o.label, value: o.value }));
      case 'theme':
        return THEME_OPTIONS.map((o) => ({ label: o.label, value: o.value }));
      case 'currency':
        return CURRENCY_OPTIONS.map((o) => ({ label: o.label, value: o.value }));
      case 'dateFormat':
        return DATE_FORMAT_OPTIONS.map((o) => ({ label: o.label, value: o.value }));
      case 'sessionTimeout':
        return SESSION_TIMEOUT_OPTIONS.map((o) => ({ label: o.label, value: String(o.value) }));
      default:
        return [];
    }
  };

  const handlePickerSelect = (value: string) => {
    switch (picker.field) {
      case 'language':
        updateSetting('language', value as LanguageOption);
        break;
      case 'theme':
        updateSetting('theme', value as ThemeMode);
        break;
      case 'currency':
        updateSetting('currency', value as CurrencyOption);
        break;
      case 'dateFormat':
        updateSetting('dateFormat', value as DateFormatOption);
        break;
      case 'sessionTimeout':
        updateSetting('sessionTimeoutMinutes', Number(value));
        break;
    }
    setPicker({ visible: false, field: null });
  };

  const getDisplayValue = (field: PickerState['field']) => {
    switch (field) {
      case 'language':
        return LANGUAGE_OPTIONS.find((o) => o.value === settings.language)?.label ?? 'English';
      case 'theme':
        return THEME_OPTIONS.find((o) => o.value === settings.theme)?.label ?? 'Light';
      case 'currency':
        return CURRENCY_OPTIONS.find((o) => o.value === settings.currency)?.label ?? 'INR';
      case 'dateFormat':
        return settings.dateFormat;
      case 'sessionTimeout':
        return SESSION_TIMEOUT_OPTIONS.find((o) => o.value === settings.sessionTimeoutMinutes)?.label ?? '30 minutes';
      default:
        return '';
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      {isOffline ? <OfflineBanner onRetry={() => void refresh()} /> : null}

      <SellerHeader
        title="App Settings"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
      >
        {isLoading ? (
          <View className="mt-lg">
            <DashboardSkeleton />
          </View>
        ) : (
          <>
            <SettingsGroup title="General">
              <SettingsToggle
                label="Notifications"
                description="Enable push notifications"
                value={settings.notificationsEnabled}
                onValueChange={(v) => updateSetting('notificationsEnabled', v)}
              />
              <SettingsToggle
                label="Order Alerts"
                value={settings.orderAlerts}
                onValueChange={(v) => updateSetting('orderAlerts', v)}
              />
              <SettingsToggle
                label="Payment Alerts"
                value={settings.paymentAlerts}
                onValueChange={(v) => updateSetting('paymentAlerts', v)}
              />
              <SettingsToggle
                label="Dispatch Alerts"
                value={settings.dispatchAlerts}
                onValueChange={(v) => updateSetting('dispatchAlerts', v)}
                isLast
              />
            </SettingsGroup>

            <SettingsGroup title="Display">
              <SettingsSelect label="Language" value={getDisplayValue('language')} onPress={() => openPicker('language')} />
              <SettingsSelect label="Theme" value={getDisplayValue('theme')} onPress={() => openPicker('theme')} />
              <SettingsSelect label="Currency" value={getDisplayValue('currency')} onPress={() => openPicker('currency')} />
              <SettingsSelect
                label="Date Format"
                value={getDisplayValue('dateFormat')}
                onPress={() => openPicker('dateFormat')}
                isLast
              />
            </SettingsGroup>

            <SettingsGroup title="Security">
              <SettingsToggle
                label="Biometric Login"
                value={settings.biometricLogin}
                onValueChange={(v) => updateSetting('biometricLogin', v)}
              />
              <SettingsToggle
                label="App Lock"
                value={settings.appLock}
                onValueChange={(v) => updateSetting('appLock', v)}
              />
              <SettingsAction
                label="Change PIN"
                description="Update your app PIN"
                onPress={() => router.push(ROUTES.SELLER.PROFILE_SECURITY as Href)}
              />
              <SettingsSelect
                label="Session Timeout"
                value={getDisplayValue('sessionTimeout')}
                onPress={() => openPicker('sessionTimeout')}
                isLast
              />
            </SettingsGroup>

            <SettingsGroup title="Privacy">
              <SettingsAction label="Privacy Policy" onPress={() => undefined} />
              <SettingsAction label="Terms of Service" onPress={() => undefined} />
              <SettingsAction label="Permissions" onPress={() => undefined} />
              <SettingsAction label="Delete Cache" onPress={() => void handleClearCache()} destructive isLast />
            </SettingsGroup>

            <SettingsGroup title="Developer">
              <SettingsToggle
                label="Mock Offline Mode"
                description="Simulate offline state for testing"
                value={settings.mockOffline}
                onValueChange={(v) => updateSetting('mockOffline', v)}
                isLast
              />
            </SettingsGroup>

            <SettingsGroup title="About">
              <SettingsInfo label="Version" value={appVersion} />
              <SettingsAction label="Licenses" onPress={() => undefined} />
              <SettingsAction label="About PetroTrade" onPress={() => undefined} isLast />
            </SettingsGroup>

            <SettingsGroup title="Business">
              <SettingsAction
                label="Settlement & Payout"
                description="View pending releases and history"
                onPress={() => router.push(ROUTES.SELLER.SETTLEMENTS as Href)}
              />
              <SettingsAction
                label="Tax & Documents"
                onPress={() => router.push(ROUTES.SELLER.SETTLEMENT_DOCUMENTS as Href)}
                isLast
              />
            </SettingsGroup>
          </>
        )}
      </ScrollView>

      <SellerBottomNavigation
        active="profile"
        onNavigate={(target) => navigateSellerBottomTab(router, target)}
      />

      <Modal visible={picker.visible} transparent animationType="fade" onRequestClose={() => setPicker({ visible: false, field: null })}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setPicker({ visible: false, field: null })}>
          <Pressable className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg" onPress={() => undefined}>
            <View className="mb-lg h-1 w-12 self-center rounded-full bg-brand-border" />
            <Typography variant="headingLeft" className="text-[20px] capitalize">
              {picker.field?.replace(/([A-Z])/g, ' $1')}
            </Typography>
            <View className="mt-lg gap-sm">
              {getPickerOptions().map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handlePickerSelect(option.value)}
                  className="rounded-xl border border-brand-border px-lg py-md"
                >
                  <Typography variant="roleTitle">{option.label}</Typography>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <StatusBottomSheet
        visible={statusSheet.visible}
        variant={statusSheet.success ? 'success' : 'error'}
        title={statusSheet.success ? 'Success' : 'Error'}
        message={statusSheet.message}
        onDismiss={() => setStatusSheet((s) => ({ ...s, visible: false }))}
      />
    </ScreenWrapper>
  );
});

import { memo, useCallback } from 'react';

import { View } from 'react-native';

import { useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { AppHeader, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { ProfileInfoRow } from '@/components/profile';
import { useProfile } from '@/hooks/useProfile';

const ADDRESS_TYPE_LABELS = {
  warehouse: 'Warehouse',
  office: 'Office',
  factory: 'Factory',
} as const;

export const SavedAddressesScreen = memo(function SavedAddressesScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddAddress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Address management will be available in a future release.',
      visibilityTime: 2000,
    });
  }, []);

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Saved Addresses" onBack={handleBack} />

      <View className="mt-lg gap-md">
        {profile.savedAddresses.map((address) => (
          <View
            key={address.id}
            className="rounded-2xl border border-brand-border bg-brand-white p-lg"
          >
            <View className="flex-row items-center justify-between">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                {ADDRESS_TYPE_LABELS[address.type]}
              </Typography>
              {address.isPrimary ? (
                <View className="rounded-full bg-brand-primary-tint px-sm py-xs">
                  <Typography variant="badge" className="text-[10px] text-brand-primary">
                    PRIMARY
                  </Typography>
                </View>
              ) : null}
            </View>

            <Typography variant="subheadingLeft" className="mt-sm text-[13px] text-brand-body">
              {address.label}
            </Typography>
            <ProfileInfoRow
              label="ADDRESS"
              value={`${address.addressLine}, ${address.city}, ${address.state} ${address.pincode}`}
            />
          </View>
        ))}
      </View>

      <PrimaryButton label="Add New Address" onPress={handleAddAddress} className="mt-xl" />
    </ScreenWrapper>
  );
});

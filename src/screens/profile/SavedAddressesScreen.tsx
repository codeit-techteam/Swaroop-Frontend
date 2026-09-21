import { memo, useCallback } from 'react';

import { Alert, Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { AppHeader, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { addressKindLabel, formatDeliveryLabel } from '@/constants/locations';
import { useDeliveryLocation } from '@/hooks/use-delivery-location';
import { EditIcon, LocationPinIcon, TrashIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useAddressStore } from '@/store/address-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const SavedAddressesScreen = memo(function SavedAddressesScreen() {
  const router = useRouter();
  const { addresses, selectedLocation, refreshAddresses } = useDeliveryLocation();
  const makeDefault = useAddressStore((state) => state.makeDefault);
  const removeAddress = useAddressStore((state) => state.removeAddress);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const openForm = useCallback(
    (id?: string) => {
      router.push({
        pathname: ROUTES.CUSTOMER.PROFILE_ADDRESS_FORM,
        params: id ? { id } : {},
      } as unknown as Href);
    },
    [router],
  );

  const handleDelete = useCallback(
    (id: string, label: string) => {
      Alert.alert('Remove address', `Delete ${label}? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void removeAddress(id)
              .then(() => Toast.show({ type: 'success', text1: 'Address removed' }))
              .catch((cause: unknown) => {
                Toast.show({
                  type: 'error',
                  text1: 'Unable to remove address',
                  text2: cause instanceof Error ? cause.message : 'Try again.',
                });
              });
          },
        },
      ]);
    },
    [removeAddress],
  );

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Saved Addresses" onBack={handleBack} />

      {addresses.length === 0 ? (
        <View className="mt-xl items-center rounded-2xl border border-dashed border-brand-border bg-brand-white px-lg py-xl">
          <LocationPinIcon size={iconSizes.xl} color={brandColors.primary} />
          <Typography variant="roleTitle" className="mt-md text-center text-[16px] text-brand-heading">
            No delivery addresses yet
          </Typography>
          <Typography variant="roleDescription" className="mt-xs text-center text-[13px] text-brand-body">
            Fetch your current location or add a warehouse so freight and checkout use the right destination.
          </Typography>
        </View>
      ) : (
        <View className="mt-lg gap-md">
          {addresses.map((address) => {
            const selected = address.id === selectedLocation.addressId || address.id === selectedLocation.id;
            return (
              <View
                key={address.id}
                className="rounded-2xl border border-brand-border bg-brand-white p-lg"
              >
                <View className="flex-row items-center justify-between">
                  <Typography variant="roleTitle" className="flex-1 text-[15px] text-brand-heading">
                    {address.label}
                  </Typography>
                  {address.isDefault || selected ? (
                    <View className="rounded-full bg-brand-primary-tint px-sm py-xs">
                      <Typography variant="badge" className="text-[10px] text-brand-primary">
                        {address.isDefault ? 'PRIMARY' : 'SELECTED'}
                      </Typography>
                    </View>
                  ) : null}
                </View>
                <Typography variant="caption" className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted">
                  {addressKindLabel(address.type)}
                </Typography>
                <Typography variant="subheadingLeft" className="mt-sm text-[13px] text-brand-body">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                </Typography>
                <Typography variant="subheadingLeft" className="text-[13px] text-brand-body">
                  {formatDeliveryLabel({
                    city: address.city,
                    state: address.state,
                    pincode: address.postalCode,
                  })}
                </Typography>

                <View className="mt-md flex-row items-center gap-md">
                  {!address.isDefault ? (
                    <Pressable
                      onPress={() => {
                        void makeDefault(address.id);
                      }}
                      accessibilityRole="button"
                    >
                      <Typography variant="link" className="text-[13px] text-brand-primary">
                        Set primary
                      </Typography>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={() => openForm(address.id)}
                    accessibilityRole="button"
                    className="flex-row items-center"
                  >
                    <EditIcon size={iconSizes.sm} color={brandColors.primary} />
                    <Typography variant="link" className="ml-xs text-[13px] text-brand-primary">
                      Edit
                    </Typography>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(address.id, address.label)}
                    accessibilityRole="button"
                    className="flex-row items-center"
                  >
                    <TrashIcon size={iconSizes.sm} color={brandColors.error} />
                    <Typography variant="link" className="ml-xs text-[13px] text-brand-error">
                      Delete
                    </Typography>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <PrimaryButton label="Add New Address" onPress={() => openForm()} className="mt-xl" />
      <Pressable
        onPress={() => {
          void refreshAddresses();
        }}
        className="mt-md items-center py-sm"
      >
        <Typography variant="link" className="text-[13px] text-brand-primary">
          Refresh from account
        </Typography>
      </Pressable>
    </ScreenWrapper>
  );
});

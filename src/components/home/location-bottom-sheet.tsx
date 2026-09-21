import { forwardRef, memo, useCallback, useMemo, useState, type ReactNode } from 'react';

import { ActivityIndicator, Keyboard, Pressable, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { DELIVERY_LOCATIONS } from '@/constants/dashboard';
import {
  addressKindLabel,
  formatDeliveryLabel,
  GPS_LOCATION_ID,
  PINCODE_REGEX,
} from '@/constants/locations';
import { LocationPinIcon, SearchIcon } from '@/icons';
import {
  fetchCurrentDeliveryAddress,
  lookupPincode,
  openLocationSettings,
  resolvePincodeAddress,
} from '@/services/location';
import {
  applyDeliveryLocation,
  resolvedToDeliveryLocation,
  selectSavedAddresses,
  toDeliveryLocation,
  useAddressStore,
} from '@/store/address-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { LocationAccessError, type ResolvedGeoAddress } from '@/types/address';
import type { DeliveryLocation } from '@/types/home';
import { cn } from '@/utils/cn';

type LocationBottomSheetProps = {
  selectedId: string;
  onSelect?: (location: DeliveryLocation) => void;
  onAddAddress?: (prefill?: ResolvedGeoAddress) => void;
};

type DetectedState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  address?: ResolvedGeoAddress;
  error?: string;
  needsSettings?: boolean;
  saving?: boolean;
};

const LocationRow = memo(function LocationRow({
  title,
  subtitle,
  selected,
  onPress,
  badge,
  trailing,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  badge?: string;
  trailing?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      className={cn(
        'mb-sm flex-row items-center rounded-xl border px-md py-md',
        selected
          ? 'border-brand-primary bg-brand-primary-light'
          : 'border-brand-border bg-brand-white',
      )}
    >
      <LocationPinIcon color={selected ? brandColors.primary : brandColors.muted} />
      <View className="ml-md flex-1">
        <View className="flex-row items-center">
          <Typography
            variant="roleTitle"
            className={cn(
              'flex-1 text-[15px]',
              selected ? 'text-brand-primary' : 'text-brand-heading',
            )}
            numberOfLines={1}
          >
            {title}
          </Typography>
          {badge ? (
            <View className="ml-sm rounded-full bg-brand-primary-tint px-sm py-0.5">
              <Typography variant="badge" className="text-[9px] text-brand-primary">
                {badge}
              </Typography>
            </View>
          ) : null}
        </View>
        <Typography
          variant="caption"
          className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
          numberOfLines={2}
        >
          {subtitle}
        </Typography>
      </View>
      {trailing ??
        (selected ? <View className="ml-sm h-2.5 w-2.5 rounded-full bg-brand-primary" /> : null)}
    </Pressable>
  );
});

export const LocationBottomSheet = memo(
  forwardRef<BottomSheetModal, LocationBottomSheetProps>(function LocationBottomSheet(
    { selectedId, onSelect, onAddAddress },
    ref,
  ) {
    const snapPoints = useMemo(() => ['72%', '92%'], []);
    const addresses = useAddressStore(selectSavedAddresses);
    const [query, setQuery] = useState('');
    const [detected, setDetected] = useState<DetectedState>({ status: 'idle' });
    const [pincodeHits, setPincodeHits] = useState<DeliveryLocation[]>([]);
    const [searchingPin, setSearchingPin] = useState(false);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
      }
      Keyboard.dismiss();
    }, [ref]);

    const commit = useCallback(
      (location: DeliveryLocation) => {
        applyDeliveryLocation(location);
        onSelect?.(location);
        dismiss();
      },
      [dismiss, onSelect],
    );

    const handleUseCurrent = useCallback(async () => {
      setDetected({ status: 'loading' });
      try {
        const address = await fetchCurrentDeliveryAddress();
        setDetected({ status: 'ready', address });
      } catch (error) {
        const access = error instanceof LocationAccessError ? error : null;
        setDetected({
          status: 'error',
          error:
            access?.message ??
            'Unable to fetch current location. Search a pincode or pick a saved address.',
          needsSettings: access?.code === 'PERMISSION_DENIED' || access?.code === 'SERVICES_DISABLED',
        });
      }
    }, []);

    const handleDeliverHere = useCallback(() => {
      if (!detected.address) return;
      commit(resolvedToDeliveryLocation(detected.address));
    }, [commit, detected.address]);

    const handleSaveCurrent = useCallback(async () => {
      if (!detected.address) return;
      if (!PINCODE_REGEX.test(detected.address.postalCode)) {
        onAddAddress?.(detected.address);
        dismiss();
        return;
      }
      setDetected((current) => ({ ...current, saving: true }));
      try {
        await useAddressStore.getState().applyResolvedLocation(detected.address, true);
        onSelect?.(resolvedToDeliveryLocation(detected.address));
        Toast.show({
          type: 'success',
          text1: 'Delivery address saved',
          text2: detected.address.formatted,
        });
        dismiss();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Could not save address',
          text2: error instanceof Error ? error.message : 'Try adding it manually.',
        });
        onAddAddress?.(detected.address);
        dismiss();
      } finally {
        setDetected((current) => ({ ...current, saving: false }));
      }
    }, [detected.address, dismiss, onAddAddress, onSelect]);

    const handleSearchChange = useCallback(async (value: string) => {
      setQuery(value);
      const pin = value.replace(/\D/g, '').slice(0, 6);
      if (pin.length !== 6) {
        setPincodeHits([]);
        return;
      }
      setSearchingPin(true);
      try {
        const hits = await lookupPincode(pin);
        setPincodeHits(
          hits.slice(0, 8).map((hit, index) => ({
            id: `pin-${hit.pincode}-${index}`,
            city: hit.city,
            state: hit.state,
            pincode: hit.pincode,
            label: formatDeliveryLabel({
              city: hit.city,
              state: hit.state,
              pincode: hit.pincode,
              area: hit.name,
            }),
            source: 'pincode' as const,
            line1: hit.name,
            landmark: hit.name,
          })),
        );
      } catch {
        const fallback = await resolvePincodeAddress(pin);
        setPincodeHits(fallback ? [resolvedToDeliveryLocation(fallback)] : []);
      } finally {
        setSearchingPin(false);
      }
    }, []);

    const filteredSaved = useMemo(() => {
      const needle = query.trim().toLowerCase();
      if (!needle) return addresses;
      return addresses.filter((address) =>
        [address.label, address.city, address.state, address.postalCode, address.line1]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      );
    }, [addresses, query]);

    const popular = useMemo(() => {
      if (query.trim()) {
        return DELIVERY_LOCATIONS.filter((location) =>
          `${location.city} ${location.label} ${location.pincode}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        );
      }
      return DELIVERY_LOCATIONS;
    }, [query]);

    const currentSelected = selectedId === GPS_LOCATION_ID;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="extend"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: brandColors.indicatorInactive }}
        backgroundStyle={{ backgroundColor: brandColors.white }}
        onDismiss={() => {
          setQuery('');
          setPincodeHits([]);
        }}
      >
        <BottomSheetScrollView
          className="flex-1"
          contentContainerClassName="px-lg pb-xl"
          keyboardShouldPersistTaps="handled"
        >
          <Typography variant="roleTitle" className="mb-md text-[17px] text-brand-heading">
            Select Delivery Location
          </Typography>

          <View className="mb-md h-11 flex-row items-center rounded-xl border border-brand-border bg-brand-surface px-md">
            <SearchIcon size={iconSizes.sm} color={brandColors.muted} />
            <BottomSheetTextInput
              value={query}
              onChangeText={(value) => {
                void handleSearchChange(value);
              }}
              placeholder="Search pincode, area or city"
              placeholderTextColor={brandColors.footer}
              keyboardType="default"
              returnKeyType="search"
              className="ml-sm flex-1 font-sans text-[14px] text-brand-heading"
            />
            {searchingPin ? <ActivityIndicator size="small" color={brandColors.primary} /> : null}
          </View>

          <Pressable
            onPress={() => {
              void handleUseCurrent();
            }}
            disabled={detected.status === 'loading'}
            accessibilityRole="button"
            accessibilityLabel="Use current location"
            className={cn(
              'mb-sm rounded-xl border px-md py-md',
              detected.status === 'ready'
                ? 'border-brand-primary bg-brand-primary-light'
                : 'border-brand-border bg-brand-white',
            )}
          >
            <View className="flex-row items-start">
              <LocationPinIcon
                color={detected.status === 'ready' ? brandColors.primary : brandColors.muted}
              />
              <View className="ml-md flex-1">
                <Typography
                  variant="roleTitle"
                  className="text-[15px] text-brand-heading"
                >
                  Use current location
                </Typography>
                {detected.status === 'idle' ? (
                  <Typography variant="caption" className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted">
                    Fetch GPS and save as your delivery address
                  </Typography>
                ) : null}
                {detected.status === 'loading' ? (
                  <View className="mt-xs flex-row items-center">
                    <ActivityIndicator size="small" color={brandColors.primary} />
                    <Typography variant="caption" className="ml-sm font-sans text-[12px] normal-case tracking-normal text-brand-muted">
                      Detecting pincode and area…
                    </Typography>
                  </View>
                ) : null}
                {detected.status === 'ready' && detected.address ? (
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                  >
                    {detected.address.formatted}
                    {detected.address.line1 ? ` · ${detected.address.line1}` : ''}
                  </Typography>
                ) : null}
                {detected.status === 'error' ? (
                  <Typography variant="caption" className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-error">
                    {detected.error}
                  </Typography>
                ) : null}
              </View>
              {currentSelected && detected.status === 'ready' ? (
                <View className="ml-sm mt-1.5 h-2.5 w-2.5 rounded-full bg-brand-primary" />
              ) : null}
            </View>

            {detected.status === 'ready' ? (
              <View className="mt-md flex-row gap-sm">
                <Pressable
                  onPress={handleDeliverHere}
                  className="flex-1 items-center rounded-lg bg-brand-heading py-sm"
                  accessibilityRole="button"
                  accessibilityLabel="Deliver here"
                >
                  <Typography variant="roleTitle" className="text-[13px] text-brand-white">
                    Deliver here
                  </Typography>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void handleSaveCurrent();
                  }}
                  disabled={detected.saving}
                  className="flex-1 items-center rounded-lg border border-brand-primary py-sm"
                  accessibilityRole="button"
                  accessibilityLabel="Save as delivery address"
                >
                  {detected.saving ? (
                    <ActivityIndicator size="small" color={brandColors.primary} />
                  ) : (
                    <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
                      Save address
                    </Typography>
                  )}
                </Pressable>
              </View>
            ) : null}

            {detected.status === 'error' && detected.needsSettings ? (
              <Pressable
                onPress={() => {
                  void openLocationSettings();
                }}
                className="mt-md items-center rounded-lg bg-brand-heading py-sm"
                accessibilityRole="button"
              >
                <Typography variant="roleTitle" className="text-[13px] text-brand-white">
                  Open settings
                </Typography>
              </Pressable>
            ) : null}
          </Pressable>

          {pincodeHits.length > 0 ? (
            <View className="mb-md">
              <Typography variant="fieldLabel" className="mb-sm text-[11px] tracking-[0.8px] text-brand-muted">
                PINCODE MATCHES
              </Typography>
              {pincodeHits.map((location) => (
                <LocationRow
                  key={location.id}
                  title={location.city}
                  subtitle={location.label}
                  selected={location.id === selectedId}
                  onPress={() => commit(location)}
                />
              ))}
            </View>
          ) : null}

          <View className="mb-sm flex-row items-center justify-between">
            <Typography variant="fieldLabel" className="text-[11px] tracking-[0.8px] text-brand-muted">
              SAVED ADDRESSES
            </Typography>
            <Pressable
              onPress={() => {
                onAddAddress?.();
                dismiss();
              }}
              accessibilityRole="button"
              accessibilityLabel="Add new address"
            >
              <Typography variant="link" className="font-semibold text-[12px] text-brand-primary">
                + Add new
              </Typography>
            </Pressable>
          </View>

          {filteredSaved.length === 0 ? (
            <Typography variant="caption" className="mb-md font-sans text-[12px] normal-case tracking-normal text-brand-muted">
              No saved warehouses yet. Use current location or add a delivery address.
            </Typography>
          ) : (
            filteredSaved.map((address) => (
              <LocationRow
                key={address.id}
                title={address.label || address.city}
                subtitle={`${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${formatDeliveryLabel(
                  {
                    city: address.city,
                    state: address.state,
                    pincode: address.postalCode,
                  },
                )}`}
                selected={address.id === selectedId}
                badge={address.isDefault ? 'PRIMARY' : addressKindLabel(address.type)}
                onPress={() => commit(toDeliveryLocation(address))}
              />
            ))
          )}

          <Typography variant="fieldLabel" className="mb-sm mt-sm text-[11px] tracking-[0.8px] text-brand-muted">
            POPULAR CITIES
          </Typography>
          {popular.map((location) => (
            <LocationRow
              key={location.id}
              title={location.city}
              subtitle={location.label}
              selected={location.id === selectedId}
              onPress={() => commit(location)}
            />
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }),
);

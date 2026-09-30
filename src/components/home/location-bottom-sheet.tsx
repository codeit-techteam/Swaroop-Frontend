import { forwardRef, memo, useCallback, useMemo, useState, type ReactNode } from 'react';

import { ActivityIndicator, Keyboard, Pressable, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { LocationSuggestionList } from '@/components/location/location-suggestion-list';
import { Typography } from '@/components/ui/typography';
import { DELIVERY_LOCATIONS } from '@/constants/dashboard';
import { addressKindLabel, formatDeliveryLabel, GPS_LOCATION_ID } from '@/constants/locations';
import { useAddressAutocomplete } from '@/hooks/use-address-autocomplete';
import { LocationPinIcon, SearchIcon } from '@/icons';
import {
  fetchCurrentDeliveryAddress,
  lookupPincode,
  normalizedToResolved,
  openLocationSettings,
  resolvePincodeAddress,
} from '@/services/location';
import {
  isLocationServiceDown,
  LOW_ACCURACY_THRESHOLD_METERS,
  type LocationSuggestion,
} from '@/services/location-search';
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
};

const isLowAccuracy = (address?: ResolvedGeoAddress) =>
  address?.captureSource === 'GPS' &&
  address.accuracyMeters != null &&
  address.accuracyMeters > LOW_ACCURACY_THRESHOLD_METERS;

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
    const [detected, setDetected] = useState<DetectedState>({ status: 'idle' });
    const [picked, setPicked] = useState<ResolvedGeoAddress | null>(null);
    const near =
      detected.address && detected.address.latitude && detected.address.longitude
        ? { latitude: detected.address.latitude, longitude: detected.address.longitude }
        : null;
    const autocomplete = useAddressAutocomplete({ near });
    const { query, setQuery } = autocomplete;
    const searchError =
      autocomplete.error && !isLocationServiceDown(autocomplete.error) ? autocomplete.error : null;
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
          needsSettings:
            access?.code === 'PERMISSION_DENIED' || access?.code === 'SERVICES_DISABLED',
        });
      }
    }, []);

    const handleDeliverHere = useCallback(() => {
      if (!detected.address) return;
      commit(resolvedToDeliveryLocation(detected.address));
    }, [commit, detected.address]);

    /** Saving always goes through the address form so the user confirms it first. */
    const handleSaveResolved = useCallback(
      (address: ResolvedGeoAddress) => {
        onAddAddress?.(address);
        dismiss();
      },
      [dismiss, onAddAddress],
    );

    const handlePickSuggestion = useCallback(
      async (suggestion: LocationSuggestion) => {
        try {
          const location = await autocomplete.selectSuggestion(suggestion);
          setPicked(normalizedToResolved(location));
          setPincodeHits([]);
          autocomplete.reset();
          Keyboard.dismiss();
        } catch {
          // The suggestion list renders the error.
        }
      },
      [autocomplete],
    );

    const handleSearchChange = useCallback(
      async (value: string) => {
        setQuery(value);
        if (value.trim()) setPicked(null);
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
      },
      [setQuery],
    );

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
          autocomplete.reset();
          setPicked(null);
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
              placeholder="Search area, street, landmark or pincode"
              placeholderTextColor={brandColors.footer}
              keyboardType="default"
              returnKeyType="search"
              className="ml-sm flex-1 font-sans text-[14px] text-brand-heading"
            />
            {searchingPin ? <ActivityIndicator size="small" color={brandColors.primary} /> : null}
          </View>

          <LocationSuggestionList
            suggestions={autocomplete.suggestions}
            status={autocomplete.status === 'error' && !searchError ? 'idle' : autocomplete.status}
            error={searchError}
            resolvingPlaceId={autocomplete.resolvingPlaceId}
            onSelect={(suggestion) => {
              void handlePickSuggestion(suggestion);
            }}
          />

          {picked ? (
            <View className="mb-sm rounded-xl border border-brand-primary bg-brand-primary-light px-md py-md">
              <View className="flex-row items-start">
                <LocationPinIcon color={brandColors.primary} />
                <View className="ml-md flex-1">
                  <Typography
                    variant="roleTitle"
                    className="text-[15px] text-brand-heading"
                    numberOfLines={1}
                  >
                    {picked.name || picked.area || picked.city}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                  >
                    {picked.formattedAddress || picked.formatted}
                  </Typography>
                </View>
              </View>
              <View className="mt-md flex-row gap-sm">
                <Pressable
                  onPress={() => commit(resolvedToDeliveryLocation(picked))}
                  className="flex-1 items-center rounded-lg bg-brand-heading py-sm"
                  accessibilityRole="button"
                  accessibilityLabel="Deliver here"
                >
                  <Typography variant="roleTitle" className="text-[13px] text-brand-white">
                    Deliver here
                  </Typography>
                </Pressable>
                <Pressable
                  onPress={() => handleSaveResolved(picked)}
                  className="flex-1 items-center rounded-lg border border-brand-primary py-sm"
                  accessibilityRole="button"
                  accessibilityLabel="Confirm and save address"
                >
                  <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
                    Save address
                  </Typography>
                </Pressable>
              </View>
            </View>
          ) : null}

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
                <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                  Use current location
                </Typography>
                {detected.status === 'idle' ? (
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                  >
                    Detect via GPS, then confirm before saving
                  </Typography>
                ) : null}
                {detected.status === 'loading' ? (
                  <View className="mt-xs flex-row items-center">
                    <ActivityIndicator size="small" color={brandColors.primary} />
                    <Typography
                      variant="caption"
                      className="ml-sm font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                    >
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
                {detected.status === 'ready' && isLowAccuracy(detected.address) ? (
                  <Typography
                    variant="caption"
                    className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-error"
                  >
                    {`Location accurate to only ~${Math.round(
                      detected.address?.accuracyMeters ?? 0,
                    )} m. Check the address before saving, or search for it.`}
                  </Typography>
                ) : null}
                {detected.status === 'error' ? (
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-error"
                  >
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
                    if (detected.address) handleSaveResolved(detected.address);
                  }}
                  className="flex-1 items-center rounded-lg border border-brand-primary py-sm"
                  accessibilityRole="button"
                  accessibilityLabel="Confirm and save address"
                >
                  <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
                    Save address
                  </Typography>
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
              <Typography
                variant="fieldLabel"
                className="mb-sm text-[11px] tracking-[0.8px] text-brand-muted"
              >
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
            <Typography
              variant="fieldLabel"
              className="text-[11px] tracking-[0.8px] text-brand-muted"
            >
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
            <Typography
              variant="caption"
              className="mb-md font-sans text-[12px] normal-case tracking-normal text-brand-muted"
            >
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

          <Typography
            variant="fieldLabel"
            className="mb-sm mt-sm text-[11px] tracking-[0.8px] text-brand-muted"
          >
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

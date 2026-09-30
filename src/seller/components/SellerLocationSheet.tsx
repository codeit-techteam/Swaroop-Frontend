import { forwardRef, memo, useCallback, useMemo, useState } from 'react';

import { ActivityIndicator, Keyboard, Pressable, View } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import { LocationSuggestionList } from '@/components/location/location-suggestion-list';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Typography } from '@/components/ui/typography';
import { PINCODE_REGEX } from '@/constants/locations';
import { useAddressAutocomplete } from '@/hooks/use-address-autocomplete';
import { LocationPinIcon, SearchIcon } from '@/icons';
import { useSellerLocationStore } from '@/seller/store/sellerLocationStore';
import {
  fetchCurrentDeliveryAddress,
  normalizedToResolved,
  openLocationSettings,
} from '@/services/location';
import {
  isLocationServiceDown,
  LOW_ACCURACY_THRESHOLD_METERS,
  type LocationSuggestion,
} from '@/services/location-search';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { LocationAccessError, type ResolvedGeoAddress } from '@/types/address';
import { cn } from '@/utils/cn';

/** GPS fixes this coarse cannot be saved as a pickup point. */
const UNUSABLE_ACCURACY_METERS = 1000;

type Draft = {
  name: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

const toDraft = (address: ResolvedGeoAddress): Draft => ({
  name: '',
  addressLine: address.line1,
  city: address.city,
  state: address.state,
  pincode: address.postalCode.replace(/\D/g, '').slice(0, 6),
});

const Field = memo(function Field({
  label,
  value,
  onChangeText,
  placeholder,
  numeric,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  numeric?: boolean;
}) {
  return (
    <View className="mb-sm">
      <Typography
        variant="fieldLabel"
        className="mb-xs text-[11px] tracking-[0.8px] text-brand-muted"
      >
        {label}
      </Typography>
      <BottomSheetTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={brandColors.footer}
        keyboardType={numeric ? 'number-pad' : 'default'}
        maxLength={numeric ? 6 : 200}
        className="h-11 rounded-xl border border-brand-border bg-brand-white px-md font-sans text-[14px] text-brand-heading"
      />
    </View>
  );
});

/**
 * Operating / pickup location picker for the seller app: search, current
 * location, or a saved warehouse. New points are only saved after the seller
 * confirms the resolved address.
 */
export const SellerLocationSheet = memo(
  forwardRef<BottomSheetModal>(function SellerLocationSheet(_props, ref) {
    const snapPoints = useMemo(() => ['80%', '94%'], []);
    const locations = useSellerLocationStore((s) => s.locations);
    const currentLocationId = useSellerLocationStore((s) => s.currentLocationId);
    const selectLocation = useSellerLocationStore((s) => s.selectLocation);
    const saveGeoLocation = useSellerLocationStore((s) => s.saveGeoLocation);

    const autocomplete = useAddressAutocomplete();
    const [candidate, setCandidate] = useState<ResolvedGeoAddress | null>(null);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [detecting, setDetecting] = useState(false);
    const [gpsError, setGpsError] = useState<{ message: string; settings: boolean } | null>(null);
    const [saving, setSaving] = useState(false);

    const searchError =
      autocomplete.error && !isLocationServiceDown(autocomplete.error) ? autocomplete.error : null;

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== 'function') ref.current?.dismiss();
      Keyboard.dismiss();
    }, [ref]);

    const reset = useCallback(() => {
      autocomplete.reset();
      setCandidate(null);
      setDraft(null);
      setGpsError(null);
      setDetecting(false);
    }, [autocomplete]);

    const adoptCandidate = useCallback((address: ResolvedGeoAddress) => {
      setCandidate(address);
      setDraft(toDraft(address));
      Keyboard.dismiss();
    }, []);

    const handlePickSuggestion = useCallback(
      async (suggestion: LocationSuggestion) => {
        try {
          const location = await autocomplete.selectSuggestion(suggestion);
          adoptCandidate(normalizedToResolved(location));
          autocomplete.reset();
        } catch {
          // The suggestion list renders the error.
        }
      },
      [autocomplete, adoptCandidate],
    );

    const handleUseCurrent = useCallback(async () => {
      setDetecting(true);
      setGpsError(null);
      try {
        adoptCandidate(await fetchCurrentDeliveryAddress());
      } catch (error) {
        const access = error instanceof LocationAccessError ? error : null;
        setGpsError({
          message:
            access?.message ?? 'Unable to detect your location. Search for the address instead.',
          settings: access?.code === 'PERMISSION_DENIED' || access?.code === 'SERVICES_DISABLED',
        });
      } finally {
        setDetecting(false);
      }
    }, [adoptCandidate]);

    const lowAccuracy =
      candidate?.captureSource === 'GPS' &&
      candidate.accuracyMeters != null &&
      candidate.accuracyMeters > LOW_ACCURACY_THRESHOLD_METERS;
    const coordsUnusable =
      lowAccuracy && (candidate?.accuracyMeters ?? 0) > UNUSABLE_ACCURACY_METERS;

    const handleSave = useCallback(async () => {
      if (!candidate || !draft) return;
      if (coordsUnusable) {
        Toast.show({
          type: 'error',
          text1: 'Location too imprecise',
          text2: 'Search for the exact warehouse address instead.',
        });
        return;
      }
      if (!draft.city.trim() || !draft.state.trim()) {
        Toast.show({ type: 'error', text1: 'Enter the city and state for this location' });
        return;
      }
      if (draft.pincode && !PINCODE_REGEX.test(draft.pincode)) {
        Toast.show({ type: 'error', text1: 'Enter a valid 6-digit pincode' });
        return;
      }
      setSaving(true);
      try {
        const city = draft.city.trim();
        const saved = await saveGeoLocation({
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          name: draft.name.trim() || `${city} Warehouse`,
          addressLine: draft.addressLine.trim() || candidate.area || city,
          addressLine2: candidate.line2,
          landmark: candidate.landmark,
          locality: candidate.area,
          city,
          district: candidate.district,
          state: draft.state.trim(),
          pincode: draft.pincode,
          country: candidate.country || 'IN',
          placeId: candidate.placeId,
          formattedAddress: candidate.formattedAddress ?? candidate.formatted,
          accuracyMeters: candidate.accuracyMeters,
          source:
            candidate.captureSource === 'AUTOCOMPLETE' ||
            candidate.captureSource === 'GPS' ||
            candidate.captureSource === 'MAP_PIN'
              ? candidate.captureSource
              : 'MANUAL',
        });
        Toast.show({
          type: 'success',
          text1: 'Operating location saved',
          text2: saved ? saved.warehouse : undefined,
        });
        dismiss();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Could not save location',
          text2: error instanceof Error ? error.message : 'Please try again.',
        });
      } finally {
        setSaving(false);
      }
    }, [candidate, coordsUnusable, dismiss, draft, saveGeoLocation]);

    const handleSelectSaved = useCallback(
      async (locationId: string) => {
        try {
          await selectLocation(locationId);
          dismiss();
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Could not switch location',
            text2: error instanceof Error ? error.message : undefined,
          });
        }
      },
      [dismiss, selectLocation],
    );

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
        onDismiss={reset}
      >
        <BottomSheetScrollView
          className="flex-1"
          contentContainerClassName="px-lg pb-xl"
          keyboardShouldPersistTaps="handled"
        >
          <Typography variant="roleTitle" className="mb-md text-[17px] text-brand-heading">
            {candidate ? 'Confirm operating location' : 'Operating location'}
          </Typography>

          {candidate && draft ? (
            <>
              <View className="mb-md rounded-xl border border-brand-primary bg-brand-primary-light px-md py-md">
                <View className="flex-row items-start">
                  <LocationPinIcon color={brandColors.primary} />
                  <View className="ml-md flex-1">
                    <Typography
                      variant="roleTitle"
                      className="text-[15px] text-brand-heading"
                      numberOfLines={1}
                    >
                      {candidate.name || candidate.area || candidate.city || 'Selected location'}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                    >
                      {candidate.formattedAddress || candidate.formatted}
                    </Typography>
                  </View>
                  <Pressable
                    onPress={() => setCandidate(null)}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Typography
                      variant="link"
                      className="font-semibold text-[12px] text-brand-primary"
                    >
                      Change
                    </Typography>
                  </Pressable>
                </View>
              </View>

              {lowAccuracy ? (
                <Typography variant="error" className="mb-md">
                  {`GPS accuracy is about ${Math.round(candidate.accuracyMeters ?? 0)} m. ${
                    coordsUnusable
                      ? 'That is too imprecise for a pickup point — search for the exact address.'
                      : 'Check the details below, or search for the exact address.'
                  }`}
                </Typography>
              ) : null}

              <Field
                label="LOCATION NAME"
                value={draft.name}
                placeholder={draft.city ? `${draft.city} Warehouse` : 'Main warehouse'}
                onChangeText={(name) => setDraft((prev) => (prev ? { ...prev, name } : prev))}
              />
              <Field
                label="ADDRESS"
                value={draft.addressLine}
                placeholder="Plot / street / industrial estate"
                onChangeText={(addressLine) =>
                  setDraft((prev) => (prev ? { ...prev, addressLine } : prev))
                }
              />
              <View className="flex-row gap-sm">
                <View className="flex-1">
                  <Field
                    label="CITY"
                    value={draft.city}
                    onChangeText={(city) => setDraft((prev) => (prev ? { ...prev, city } : prev))}
                  />
                </View>
                <View className="flex-1">
                  <Field
                    label="PINCODE"
                    value={draft.pincode}
                    numeric
                    onChangeText={(value) =>
                      setDraft((prev) =>
                        prev ? { ...prev, pincode: value.replace(/\D/g, '').slice(0, 6) } : prev,
                      )
                    }
                  />
                </View>
              </View>
              <Field
                label="STATE"
                value={draft.state}
                onChangeText={(state) => setDraft((prev) => (prev ? { ...prev, state } : prev))}
              />

              <PrimaryButton
                label="Confirm & save"
                onPress={() => {
                  void handleSave();
                }}
                loading={saving}
                disabled={saving || coordsUnusable}
                className="mt-sm rounded-2xl py-md"
              />
            </>
          ) : (
            <>
              <View className="mb-md h-11 flex-row items-center rounded-xl border border-brand-border bg-brand-surface px-md">
                <SearchIcon size={iconSizes.sm} color={brandColors.muted} />
                <BottomSheetTextInput
                  value={autocomplete.query}
                  onChangeText={autocomplete.setQuery}
                  placeholder="Search warehouse area, street or pincode"
                  placeholderTextColor={brandColors.footer}
                  autoCorrect={false}
                  returnKeyType="search"
                  className="ml-sm flex-1 font-sans text-[14px] text-brand-heading"
                />
              </View>

              <LocationSuggestionList
                suggestions={autocomplete.suggestions}
                status={
                  autocomplete.status === 'error' && !searchError ? 'idle' : autocomplete.status
                }
                error={searchError}
                resolvingPlaceId={autocomplete.resolvingPlaceId}
                onSelect={(suggestion) => {
                  void handlePickSuggestion(suggestion);
                }}
              />

              <Pressable
                onPress={() => {
                  void handleUseCurrent();
                }}
                disabled={detecting}
                accessibilityRole="button"
                accessibilityLabel="Use current location"
                className="mb-md rounded-xl border border-brand-border bg-brand-white px-md py-md"
              >
                <View className="flex-row items-center">
                  {detecting ? (
                    <ActivityIndicator size="small" color={brandColors.primary} />
                  ) : (
                    <LocationPinIcon color={brandColors.primary} />
                  )}
                  <View className="ml-md flex-1">
                    <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                      {detecting ? 'Detecting your location…' : 'Use current location'}
                    </Typography>
                    <Typography
                      variant="caption"
                      className={cn(
                        'mt-0.5 font-sans text-[12px] normal-case tracking-normal',
                        gpsError ? 'text-brand-error' : 'text-brand-muted',
                      )}
                    >
                      {gpsError?.message ?? 'Detect via GPS, then confirm before saving'}
                    </Typography>
                  </View>
                </View>
                {gpsError?.settings ? (
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

              <Typography
                variant="fieldLabel"
                className="mb-sm text-[11px] tracking-[0.8px] text-brand-muted"
              >
                SAVED LOCATIONS
              </Typography>
              {locations.length === 0 ? (
                <Typography
                  variant="caption"
                  className="font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                >
                  No operating locations yet. Search or use your current location to add one.
                </Typography>
              ) : (
                locations.map((location) => {
                  const selected = location.id === currentLocationId;
                  return (
                    <Pressable
                      key={location.id}
                      onPress={() => {
                        void handleSelectSaved(location.id);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      className={cn(
                        'mb-sm flex-row items-center rounded-xl border px-md py-md',
                        selected
                          ? 'border-brand-primary bg-brand-primary-light'
                          : 'border-brand-border bg-brand-white',
                      )}
                    >
                      <LocationPinIcon color={selected ? brandColors.primary : brandColors.muted} />
                      <View className="ml-md flex-1">
                        <Typography
                          variant="roleTitle"
                          className={cn(
                            'text-[15px]',
                            selected ? 'text-brand-primary' : 'text-brand-heading',
                          )}
                          numberOfLines={1}
                        >
                          {location.city || location.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                          numberOfLines={1}
                        >
                          {location.warehouse}
                          {location.state ? ` · ${location.state}` : ''}
                        </Typography>
                      </View>
                      {selected ? (
                        <View className="ml-sm h-2.5 w-2.5 rounded-full bg-brand-primary" />
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }),
);

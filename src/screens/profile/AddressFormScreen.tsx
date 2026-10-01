import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, Pressable, Switch, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import {
  AppHeader,
  DropdownField,
  InputField,
  PrimaryButton,
  ScreenWrapper,
  Typography,
} from '@/components';
import { LocationSuggestionList } from '@/components/location/location-suggestion-list';
import { ADDRESS_KIND_OPTIONS, PINCODE_REGEX, toApiAddressType } from '@/constants/locations';
import { useAddressAutocomplete } from '@/hooks/use-address-autocomplete';
import { SearchIcon } from '@/icons';
import {
  CURRENT_LOCATION_PHASE_LABELS,
  type CurrentLocationPhase,
  fetchCurrentDeliveryAddress,
  getSearchBiasPosition,
  lookupPincode,
  normalizedToResolved,
} from '@/services/location';
import {
  isLocationServiceDown,
  LOW_ACCURACY_THRESHOLD_METERS,
  type LocationSuggestion,
} from '@/services/location-search';
import { useAddressStore } from '@/store/address-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { AddressCaptureSource, ResolvedGeoAddress, SavedAddressKind } from '@/types/address';
import { LocationAccessError } from '@/types/address';
import { logger } from '@/utils/logger';

const KIND_LABELS = ADDRESS_KIND_OPTIONS.map((option) => option.label);
/** GPS fixes this coarse are never stored as the address coordinates. */
const UNUSABLE_ACCURACY_METERS = 1000;
const CAPTURE_SOURCES: AddressCaptureSource[] = [
  'AUTOCOMPLETE',
  'GPS',
  'MAP_PIN',
  'PINCODE',
  'MANUAL',
];

type GeoMeta = {
  locality: string;
  district: string;
  placeId: string | null;
  formattedAddress: string;
  accuracyMeters: number | null;
  source: AddressCaptureSource;
};

const EMPTY_GEO: GeoMeta = {
  locality: '',
  district: '',
  placeId: null,
  formattedAddress: '',
  accuracyMeters: null,
  source: 'MANUAL',
};

const toCaptureSource = (value?: string | null): AddressCaptureSource => {
  const upper = (value ?? '').toUpperCase() as AddressCaptureSource;
  return CAPTURE_SOURCES.includes(upper) ? upper : 'MANUAL';
};

export const AddressFormScreen = memo(function AddressFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    label?: string;
    type?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    landmark?: string;
    latitude?: string;
    longitude?: string;
    district?: string;
    locality?: string;
    placeId?: string;
    formattedAddress?: string;
    accuracyMeters?: string;
    source?: string;
  }>();

  const addresses = useAddressStore((state) => state.addresses);
  const createAddress = useAddressStore((state) => state.createAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);

  const editing = addresses.find((row) => row.id === params.id);

  const [typeLabel, setTypeLabel] = useState('Warehouse');
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gpsPhase, setGpsPhase] = useState<CurrentLocationPhase | null>(null);
  const detecting = gpsPhase != null;
  const [lookingUpPin, setLookingUpPin] = useState(false);
  const [geo, setGeo] = useState<GeoMeta>(EMPTY_GEO);
  const hasSeed = Boolean(editing || params.line1 || params.latitude);
  const [step, setStep] = useState<'search' | 'details'>(hasSeed ? 'details' : 'search');
  const [devicePoint, setDevicePoint] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const autocomplete = useAddressAutocomplete({
    near: latitude != null && longitude != null ? { latitude, longitude } : devicePoint,
  });

  useEffect(() => {
    let active = true;
    void getSearchBiasPosition().then((point) => {
      if (active) setDevicePoint(point);
    });
    return () => {
      active = false;
    };
  }, []);
  const autocompleteUnavailable = Boolean(
    autocomplete.error && isLocationServiceDown(autocomplete.error),
  );
  const searchError = autocompleteUnavailable ? null : autocomplete.error;

  const seedKey = [
    params.id,
    params.line1,
    params.city,
    params.state,
    params.postalCode,
    params.latitude,
    params.longitude,
    editing?.id,
  ].join('|');

  useEffect(() => {
    const source = editing ?? {
      type: params.type,
      label: params.label,
      line1: params.line1,
      line2: params.line2,
      city: params.city,
      state: params.state,
      postalCode: params.postalCode,
      landmark: params.landmark,
      latitude: params.latitude ? Number(params.latitude) : null,
      longitude: params.longitude ? Number(params.longitude) : null,
      isDefault: false,
    };

    const apiType = toApiAddressType(source.type);
    const kind = ADDRESS_KIND_OPTIONS.find((option) => option.value === apiType);
    setTypeLabel(kind?.label ?? 'Warehouse');
    setLabel(source.label ?? '');
    setLine1(source.line1 ?? '');
    setLine2(source.line2 ?? '');
    setCity(source.city ?? '');
    setStateName(source.state ?? '');
    setPostalCode(source.postalCode ?? '');
    setLandmark(source.landmark ?? '');
    setLatitude(
      typeof source.latitude === 'number' && Number.isFinite(source.latitude)
        ? source.latitude
        : null,
    );
    setLongitude(
      typeof source.longitude === 'number' && Number.isFinite(source.longitude)
        ? source.longitude
        : null,
    );
    setIsDefault(Boolean(editing?.isDefault) || addresses.length === 0);
    const accuracy =
      editing?.accuracyMeters ?? (params.accuracyMeters ? Number(params.accuracyMeters) : null);
    setGeo({
      locality: editing?.locality ?? params.locality ?? '',
      district: editing?.district ?? params.district ?? '',
      placeId: editing?.placeId ?? (params.placeId || null),
      formattedAddress: editing?.formattedAddress ?? params.formattedAddress ?? '',
      accuracyMeters: accuracy != null && Number.isFinite(accuracy) ? accuracy : null,
      source: toCaptureSource(editing?.source ?? params.source),
    });
    setStep(editing || source.line1 || source.latitude != null ? 'details' : 'search');
    // Seed once per navigation payload so typing is not reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey]);

  const kindValue = useMemo<SavedAddressKind>(() => {
    return (ADDRESS_KIND_OPTIONS.find((option) => option.label === typeLabel)?.value ??
      'WAREHOUSE') as SavedAddressKind;
  }, [typeLabel]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handlePincodeChange = useCallback(async (value: string) => {
    const pin = value.replace(/\D/g, '').slice(0, 6);
    setPostalCode(pin);
    if (pin.length !== 6) {
      return;
    }
    setLookingUpPin(true);
    try {
      const hits = await lookupPincode(pin);
      const first = hits[0];
      if (first) {
        setCity((current) => current || first.city);
        setStateName((current) => current || first.state);
        setLine1((current) => current || first.name);
      }
    } finally {
      setLookingUpPin(false);
    }
  }, []);

  const applyResolved = useCallback((resolved: ResolvedGeoAddress) => {
    setLine1(resolved.line1);
    setLine2(resolved.line2 ?? '');
    setCity(resolved.city);
    setStateName(resolved.state);
    setPostalCode(resolved.postalCode.replace(/\D/g, '').slice(0, 6));
    setLandmark(resolved.landmark ?? '');
    setLatitude(resolved.latitude || null);
    setLongitude(resolved.longitude || null);
    setLabel((current) => current || resolved.name || resolved.area || resolved.city);
    setGeo({
      locality: resolved.area ?? '',
      district: resolved.district ?? '',
      placeId: resolved.placeId ?? null,
      formattedAddress: resolved.formattedAddress ?? resolved.formatted ?? '',
      accuracyMeters: resolved.accuracyMeters ?? null,
      source: resolved.captureSource ?? 'GPS',
    });
    setStep('details');
  }, []);

  const startManualEntry = useCallback(() => {
    autocomplete.reset();
    setError(null);
    setStep('details');
  }, [autocomplete]);

  const backToSearch = useCallback(() => {
    setError(null);
    setStep('search');
  }, []);

  const handlePickSuggestion = useCallback(
    async (suggestion: LocationSuggestion) => {
      setError(null);
      try {
        const location = await autocomplete.selectSuggestion(suggestion);
        applyResolved(normalizedToResolved(location));
        autocomplete.reset();
      } catch {
        // The suggestion list renders the error.
      }
    },
    [applyResolved, autocomplete],
  );

  const handleUseGps = useCallback(async () => {
    setGpsPhase('locating');
    setError(null);
    try {
      applyResolved(await fetchCurrentDeliveryAddress(setGpsPhase));
    } catch (cause) {
      logger.warn('Current location failed', {
        code: cause instanceof LocationAccessError ? cause.code : 'unknown',
      });
      setError(
        cause instanceof LocationAccessError
          ? cause.message
          : 'Unable to fetch current location. Search for your address instead.',
      );
    } finally {
      setGpsPhase(null);
    }
  }, [applyResolved]);

  const lowAccuracy =
    geo.source === 'GPS' &&
    geo.accuracyMeters != null &&
    geo.accuracyMeters > LOW_ACCURACY_THRESHOLD_METERS;
  const coordsUnusable = lowAccuracy && (geo.accuracyMeters ?? 0) > UNUSABLE_ACCURACY_METERS;

  const onSave = useCallback(async () => {
    if (saving) return;
    if (line1.trim().length < 3) {
      setError('Enter a street or warehouse address.');
      return;
    }
    if (!PINCODE_REGEX.test(postalCode)) {
      setError('Enter a valid 6-digit pincode.');
      return;
    }
    if (!city.trim() || !stateName.trim()) {
      setError('City and state are required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const keepCoords = latitude != null && longitude != null && !coordsUnusable;
      const payload = {
        type: kindValue,
        label: label.trim() || city.trim(),
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: stateName.trim(),
        postalCode,
        landmark: landmark.trim() || undefined,
        latitude: keepCoords ? latitude : null,
        longitude: keepCoords ? longitude : null,
        locality: geo.locality || undefined,
        district: geo.district || undefined,
        placeId: keepCoords ? geo.placeId : undefined,
        formattedAddress: geo.formattedAddress || undefined,
        accuracyMeters: keepCoords ? geo.accuracyMeters : undefined,
        source: keepCoords ? geo.source : ('MANUAL' as const),
        isDefault,
      };
      if (editing) {
        await updateAddress(editing.id, payload);
        Toast.show({ type: 'success', text1: 'Address updated' });
      } else {
        await createAddress(payload);
        Toast.show({ type: 'success', text1: 'Delivery address saved' });
      }
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save address.');
    } finally {
      setSaving(false);
    }
  }, [
    city,
    coordsUnusable,
    createAddress,
    editing,
    geo,
    isDefault,
    kindValue,
    label,
    landmark,
    latitude,
    line1,
    line2,
    longitude,
    postalCode,
    router,
    saving,
    stateName,
    updateAddress,
  ]);

  const currentLocationButton = (
    <Pressable
      onPress={() => {
        void handleUseGps();
      }}
      disabled={detecting || saving}
      className="mb-md flex-row items-center rounded-xl border border-brand-primary bg-brand-primary-light px-md py-md"
      accessibilityRole="button"
      accessibilityLabel="Use current location"
      accessibilityState={{ busy: detecting, disabled: detecting || saving }}
    >
      {gpsPhase ? (
        <>
          <ActivityIndicator size="small" color={brandColors.primary} />
          <Typography variant="roleTitle" className="ml-sm flex-1 text-[14px] text-brand-primary">
            {CURRENT_LOCATION_PHASE_LABELS[gpsPhase]}
          </Typography>
        </>
      ) : (
        <Typography variant="roleTitle" className="text-[14px] text-brand-primary">
          Use current location
        </Typography>
      )}
    </Pressable>
  );

  return (
    <ScreenWrapper className="bg-brand-background" padded={false} edges={['top']}>
      <AppHeader
        variant="back"
        title={editing ? 'Edit Address' : 'Add Delivery Address'}
        onBack={handleBack}
      />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-xl pb-xl"
        keyboardShouldPersistTaps="handled"
      >
        {step === 'search' ? (
          <>
            {autocompleteUnavailable ? (
              <Typography variant="error" className="mb-md">
                Address search is unavailable right now. Use your current location or enter the
                address manually.
              </Typography>
            ) : (
              <>
                <InputField
                  label="SEARCH ADDRESS"
                  value={autocomplete.query}
                  onChangeText={autocomplete.setQuery}
                  placeholder="Search area, street, landmark or pincode"
                  autoCorrect={false}
                  autoFocus={!editing}
                  returnKeyType="search"
                  leftSlot={
                    <View className="mr-sm">
                      <SearchIcon size={iconSizes.sm} color={brandColors.muted} />
                    </View>
                  }
                  containerClassName="mb-sm"
                />
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
              </>
            )}

            {currentLocationButton}

            {error ? (
              <Typography variant="error" className="mb-md">
                {error}
              </Typography>
            ) : null}

            <Pressable
              onPress={startManualEntry}
              className="self-start py-sm"
              accessibilityRole="button"
              accessibilityLabel="Enter address manually"
            >
              <Typography
                variant="caption"
                className="font-sans-semibold text-[13px] normal-case tracking-normal text-brand-muted"
              >
                Enter address manually
              </Typography>
            </Pressable>
          </>
        ) : null}

        {step === 'details' ? (
          <>
            <View className="mb-md flex-row items-start rounded-xl border border-brand-border bg-brand-white px-md py-md">
              <View className="flex-1 pr-md">
                <Typography
                  variant="roleTitle"
                  className="text-[14px] text-brand-heading"
                  numberOfLines={1}
                >
                  {label.trim() || geo.locality || city.trim() || 'Delivery location'}
                </Typography>
                <Typography
                  variant="caption"
                  className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                >
                  {geo.formattedAddress ||
                    [line1, line2, city, stateName, postalCode]
                      .map((part) => part.trim())
                      .filter(Boolean)
                      .join(', ') ||
                    'Enter the address details below'}
                </Typography>
              </View>
              <Pressable
                onPress={backToSearch}
                accessibilityRole="button"
                accessibilityLabel="Change location"
              >
                <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
                  Change
                </Typography>
              </Pressable>
            </View>

            {latitude == null || longitude == null ? currentLocationButton : null}

            {lowAccuracy ? (
              <Typography variant="error" className="-mt-sm mb-md">
                {`GPS accuracy is about ${Math.round(geo.accuracyMeters ?? 0)} m. Check every field below${
                  coordsUnusable
                    ? ' — this position is too imprecise to store, so only the typed address will be saved'
                    : ''
                }, or search for the exact address.`}
              </Typography>
            ) : null}

            {autocompleteUnavailable ? null : (
              <>
                <InputField
                  label="SEARCH ADDRESS"
                  value={autocomplete.query}
                  onChangeText={autocomplete.setQuery}
                  placeholder="Search area, building, landmark or PIN"
                  autoCorrect={false}
                  returnKeyType="search"
                  leftSlot={
                    <View className="mr-sm">
                      <SearchIcon size={iconSizes.sm} color={brandColors.muted} />
                    </View>
                  }
                  containerClassName="mb-sm"
                />
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
              </>
            )}

            <DropdownField
              label="ADDRESS TYPE"
              value={typeLabel}
              options={KIND_LABELS}
              onChange={setTypeLabel}
              containerClassName="mb-md"
            />
            <InputField
              label="SAVE AS"
              value={label}
              onChangeText={setLabel}
              placeholder="Optional nickname, e.g. Main plant"
              containerClassName="mb-md"
            />
            <InputField
              label="ADDRESS LINE 1"
              value={line1}
              onChangeText={setLine1}
              placeholder="Plot / street / industrial estate"
              containerClassName="mb-md"
            />
            <InputField
              label="ADDRESS LINE 2"
              value={line2}
              onChangeText={setLine2}
              placeholder="Area, landmark"
              containerClassName="mb-md"
            />
            <InputField
              label="PINCODE"
              value={postalCode}
              onChangeText={(value) => {
                void handlePincodeChange(value);
              }}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit pincode"
              rightSlot={
                lookingUpPin ? <ActivityIndicator size="small" color={brandColors.primary} /> : null
              }
              containerClassName="mb-md"
            />
            <InputField
              label="CITY"
              value={city}
              onChangeText={setCity}
              placeholder="City"
              containerClassName="mb-md"
            />
            <InputField
              label="STATE"
              value={stateName}
              onChangeText={setStateName}
              placeholder="State"
              containerClassName="mb-md"
            />
            <InputField
              label="LANDMARK"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Near highway / port"
              containerClassName="mb-lg"
            />

            <View className="mb-lg flex-row items-center justify-between rounded-xl border border-brand-border bg-brand-white px-md py-md">
              <View className="flex-1 pr-md">
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  Set as primary
                </Typography>
                <Typography
                  variant="caption"
                  className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                >
                  Used for checkout freight and home delivery
                </Typography>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: brandColors.border, true: brandColors.primaryLight }}
                thumbColor={isDefault ? brandColors.primary : brandColors.muted}
              />
            </View>

            {error ? (
              <Typography variant="error" className="mb-md">
                {error}
              </Typography>
            ) : null}

            <PrimaryButton
              label={editing ? 'Update Address' : 'Save Address'}
              onPress={() => {
                void onSave();
              }}
              loading={saving}
              disabled={detecting}
            />
          </>
        ) : null}
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
});

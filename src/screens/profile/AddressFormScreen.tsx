import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, Pressable, Switch, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import { AppHeader, DropdownField, InputField, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { ADDRESS_KIND_OPTIONS, PINCODE_REGEX } from '@/constants/locations';
import { fetchCurrentDeliveryAddress, lookupPincode } from '@/services/location';
import { useAddressStore } from '@/store/address-store';
import { brandColors } from '@/theme/colors';
import type { SavedAddressKind } from '@/types/address';
import { LocationAccessError } from '@/types/address';

const KIND_LABELS = ADDRESS_KIND_OPTIONS.map((option) => option.label);

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
  const [detecting, setDetecting] = useState(false);
  const [lookingUpPin, setLookingUpPin] = useState(false);

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

    const kind = ADDRESS_KIND_OPTIONS.find((option) => option.value === source.type);
    setTypeLabel(kind?.label ?? 'Warehouse');
    setLabel(source.label ?? '');
    setLine1(source.line1 ?? '');
    setLine2(source.line2 ?? '');
    setCity(source.city ?? '');
    setStateName(source.state ?? '');
    setPostalCode(source.postalCode ?? '');
    setLandmark(source.landmark ?? '');
    setLatitude(typeof source.latitude === 'number' && Number.isFinite(source.latitude) ? source.latitude : null);
    setLongitude(
      typeof source.longitude === 'number' && Number.isFinite(source.longitude) ? source.longitude : null,
    );
    setIsDefault(Boolean(editing?.isDefault) || addresses.length === 0);
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

  const handleUseGps = useCallback(async () => {
    setDetecting(true);
    setError(null);
    try {
      const resolved = await fetchCurrentDeliveryAddress();
      setLine1((current) => current || resolved.line1);
      setLine2((current) => current || resolved.line2 || '');
      setCity(resolved.city);
      setStateName(resolved.state);
      setPostalCode(resolved.postalCode);
      setLandmark((current) => current || resolved.area || '');
      setLatitude(resolved.latitude || null);
      setLongitude(resolved.longitude || null);
      if (!label.trim()) {
        setLabel(resolved.area || 'Current location');
      }
    } catch (cause) {
      setError(
        cause instanceof LocationAccessError
          ? cause.message
          : 'Unable to fetch current location. Enter the address manually.',
      );
    } finally {
      setDetecting(false);
    }
  }, [label]);

  const onSave = useCallback(async () => {
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
      const payload = {
        type: kindValue,
        label: label.trim() || city.trim(),
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: stateName.trim(),
        postalCode,
        landmark: landmark.trim() || undefined,
        latitude,
        longitude,
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
    createAddress,
    editing,
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
    stateName,
    updateAddress,
  ]);

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
        <Pressable
          onPress={() => {
            void handleUseGps();
          }}
          disabled={detecting}
          className="mb-lg flex-row items-center rounded-xl border border-brand-primary bg-brand-primary-light px-md py-md"
          accessibilityRole="button"
          accessibilityLabel="Use current location"
        >
          {detecting ? (
            <ActivityIndicator size="small" color={brandColors.primary} />
          ) : (
            <Typography variant="roleTitle" className="text-[14px] text-brand-primary">
              Use current location
            </Typography>
          )}
          <Typography
            variant="caption"
            className="ml-sm flex-1 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
          >
            Auto-fill from GPS like Amazon / Myntra
          </Typography>
        </Pressable>

        <DropdownField
          label="ADDRESS TYPE"
          value={typeLabel}
          options={KIND_LABELS}
          onChange={setTypeLabel}
          containerClassName="mb-md"
        />
        <InputField
          label="LABEL"
          value={label}
          onChangeText={setLabel}
          placeholder="Primary Warehouse"
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
          placeholder="400001"
          rightSlot={lookingUpPin ? <ActivityIndicator size="small" color={brandColors.primary} /> : null}
          containerClassName="mb-md"
        />
        <InputField
          label="CITY"
          value={city}
          onChangeText={setCity}
          placeholder="Mumbai"
          containerClassName="mb-md"
        />
        <InputField
          label="STATE"
          value={stateName}
          onChangeText={setStateName}
          placeholder="Maharashtra"
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
            <Typography variant="caption" className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted">
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
        />
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
});

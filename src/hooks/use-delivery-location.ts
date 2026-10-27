import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  isDeliveryLocationChosen,
  isPersistedAddressId,
  resolveDeliveryLocation,
} from '@/constants/locations';
import { ROUTES } from '@/navigation/routes';
import {
  applyDeliveryLocation,
  selectSavedAddresses,
  selectSelectedAddressId,
  toDeliveryLocation,
  useAddressStore,
} from '@/store/address-store';
import { selectIsLoggedIn, selectLocation, useAuthStore } from '@/store/auth-store';
import type { ResolvedGeoAddress } from '@/types/address';
import type { DeliveryLocation } from '@/types/home';

export function pushAddressForm(
  router: { push: (href: Href) => void },
  prefill?: ResolvedGeoAddress,
  id?: string,
) {
  router.push({
    pathname: ROUTES.CUSTOMER.PROFILE_ADDRESS_FORM,
    params: {
      ...(id ? { id } : {}),
      ...(prefill
        ? {
            label: prefill.name || prefill.area || 'Current location',
            type: 'SHIPPING',
            line1: prefill.line1,
            line2: prefill.line2 ?? '',
            city: prefill.city,
            state: prefill.state,
            postalCode: prefill.postalCode,
            landmark: prefill.area ?? '',
            latitude: prefill.latitude ? String(prefill.latitude) : '',
            longitude: prefill.longitude ? String(prefill.longitude) : '',
            district: prefill.district ?? '',
            locality: prefill.area ?? '',
            placeId: prefill.placeId ?? '',
            formattedAddress: prefill.formattedAddress ?? '',
            accuracyMeters: prefill.accuracyMeters != null ? String(prefill.accuracyMeters) : '',
            source: prefill.captureSource ?? '',
          }
        : {}),
    },
  } as unknown as Href);
}

export function useDeliveryLocation() {
  const persisted = useAuthStore(selectLocation);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const setLocation = useAuthStore((state) => state.setLocation);
  const addresses = useAddressStore(selectSavedAddresses);
  const selectedAddressId = useAddressStore(selectSelectedAddressId);
  const hydrate = useAddressStore((state) => state.hydrate);
  const fetchRemote = useAddressStore((state) => state.fetchRemote);
  const isHydrated = useAddressStore((state) => state.isHydrated);
  const isSyncing = useAddressStore((state) => state.isSyncing);

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  // Guests must not pull account addresses (or a dev demo session) into Market.
  useEffect(() => {
    if (!isHydrated || !isLoggedIn) {
      return;
    }
    void fetchRemote();
  }, [fetchRemote, isHydrated, isLoggedIn]);

  // Drop legacy sample pins (Mumbai/Chennai presets) left in app settings (N-06).
  useEffect(() => {
    if (persisted && !isDeliveryLocationChosen(persisted)) {
      setLocation(null);
    }
  }, [persisted, setLocation]);

  const fromAddressBook = isLoggedIn
    ? addresses.find((row) => row.id === selectedAddressId) ??
      addresses.find((row) => row.isDefault)
    : undefined;

  const selectedLocation: DeliveryLocation = resolveDeliveryLocation(
    isDeliveryLocationChosen(persisted)
      ? persisted
      : fromAddressBook
        ? toDeliveryLocation(fromAddressBook)
        : null,
  );

  const selectLocationValue = useCallback((location: DeliveryLocation) => {
    applyDeliveryLocation(location);
  }, []);

  const router = useRouter();
  const openAddressForm = useCallback(
    (prefill?: ResolvedGeoAddress, id?: string) => {
      pushAddressForm(router, prefill, id);
    },
    [router],
  );

  const shippingAddressId = isPersistedAddressId(selectedLocation.addressId ?? selectedLocation.id)
    ? (selectedLocation.addressId ?? selectedLocation.id)
    : undefined;

  return {
    selectedLocation,
    addresses,
    selectedAddressId,
    isSyncing,
    shippingAddressId,
    selectLocation: selectLocationValue,
    refreshAddresses: fetchRemote,
    openAddressForm,
  };
}

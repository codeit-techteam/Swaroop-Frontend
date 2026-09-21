import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  FALLBACK_DELIVERY_LOCATION,
  isPersistedAddressId,
} from '@/constants/locations';
import { ROUTES } from '@/navigation/routes';
import {
  applyDeliveryLocation,
  selectSavedAddresses,
  selectSelectedAddressId,
  toDeliveryLocation,
  useAddressStore,
} from '@/store/address-store';
import { selectLocation, useAuthStore } from '@/store/auth-store';
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
            label: prefill.area || 'Current location',
            type: 'SHIPPING',
            line1: prefill.line1,
            line2: prefill.line2 ?? '',
            city: prefill.city,
            state: prefill.state,
            postalCode: prefill.postalCode,
            landmark: prefill.area ?? '',
            latitude: prefill.latitude ? String(prefill.latitude) : '',
            longitude: prefill.longitude ? String(prefill.longitude) : '',
          }
        : {}),
    },
  } as unknown as Href);
}

export function useDeliveryLocation() {
  const persisted = useAuthStore(selectLocation);
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

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    void fetchRemote();
  }, [fetchRemote, isHydrated]);

  const selectedLocation: DeliveryLocation =
    persisted ??
    (addresses.find((row) => row.id === selectedAddressId)
      ? toDeliveryLocation(addresses.find((row) => row.id === selectedAddressId)!)
      : addresses.find((row) => row.isDefault)
        ? toDeliveryLocation(addresses.find((row) => row.isDefault)!)
        : FALLBACK_DELIVERY_LOCATION);

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

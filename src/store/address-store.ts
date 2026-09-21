import { create } from 'zustand';

import { FALLBACK_DELIVERY_LOCATION, formatDeliveryLabel, GPS_LOCATION_ID, isPersistedAddressId, PINCODE_REGEX } from '@/constants/locations';
import {
  createSavedAddress,
  deleteSavedAddress,
  fetchSavedAddresses,
  setDefaultSavedAddress,
  updateSavedAddress,
} from '@/services/addresses';
import { selectLocation, useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { STORAGE_KEYS } from '@/constants';
import type { AddressDraft, ResolvedGeoAddress, SavedDeliveryAddress } from '@/types/address';
import type { DeliveryLocation } from '@/types/home';
import type { CartDeliveryLocation } from '@/types/product';
import { getStorageItem, setStorageItem } from '@/utils/storage';

type PersistedAddressState = {
  addresses: SavedDeliveryAddress[];
  selectedAddressId: string | null;
};

type AddressState = PersistedAddressState & {
  isHydrated: boolean;
  isSyncing: boolean;
  lastError: string | null;
};

type AddressActions = {
  hydrate: () => void;
  fetchRemote: () => Promise<SavedDeliveryAddress[]>;
  createAddress: (draft: AddressDraft) => Promise<SavedDeliveryAddress>;
  updateAddress: (id: string, draft: Partial<AddressDraft>) => Promise<SavedDeliveryAddress>;
  removeAddress: (id: string) => Promise<void>;
  makeDefault: (id: string) => Promise<void>;
  selectAddress: (address: SavedDeliveryAddress | DeliveryLocation) => void;
  applyResolvedLocation: (resolved: ResolvedGeoAddress, persist?: boolean) => Promise<DeliveryLocation>;
  getSelectedLocation: () => DeliveryLocation;
};

export type AddressStore = AddressState & AddressActions;

const readPersisted = (): PersistedAddressState => {
  const raw = getStorageItem(STORAGE_KEYS.CUSTOMER_ADDRESSES);
  if (!raw) {
    return { addresses: [], selectedAddressId: null };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAddressState>;
    return {
      addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
      selectedAddressId: typeof parsed.selectedAddressId === 'string' ? parsed.selectedAddressId : null,
    };
  } catch {
    return { addresses: [], selectedAddressId: null };
  }
};

const persist = (state: PersistedAddressState) => {
  setStorageItem(STORAGE_KEYS.CUSTOMER_ADDRESSES, JSON.stringify(state));
};

export function toDeliveryLocation(
  address: SavedDeliveryAddress | DeliveryLocation,
): DeliveryLocation {
  if ('postalCode' in address && 'line1' in address) {
    const saved = address as SavedDeliveryAddress;
    return {
      id: saved.id,
      city: saved.city,
      state: saved.state,
      pincode: saved.postalCode,
      label: formatDeliveryLabel({
        city: saved.city,
        state: saved.state,
        pincode: saved.postalCode,
        area: saved.landmark ?? undefined,
      }),
      source: 'saved',
      addressId: saved.id,
      line1: saved.line1,
      line2: saved.line2,
      landmark: saved.landmark,
      latitude: saved.latitude,
      longitude: saved.longitude,
    };
  }
  return address;
}

export function toCartDelivery(location: DeliveryLocation): CartDeliveryLocation {
  return {
    city: location.city,
    state: location.state,
    label: location.label,
    etaLabel: '2–3 Business Days',
  };
}

export function resolvedToDeliveryLocation(resolved: ResolvedGeoAddress): DeliveryLocation {
  return {
    id: GPS_LOCATION_ID,
    city: resolved.city,
    state: resolved.state,
    pincode: resolved.postalCode,
    label: resolved.formatted,
    source: resolved.source === 'pincode' ? 'pincode' : 'gps',
    line1: resolved.line1,
    line2: resolved.line2 ?? null,
    landmark: resolved.area ?? null,
    latitude: resolved.latitude || null,
    longitude: resolved.longitude || null,
  };
}

export function applyDeliveryLocation(location: DeliveryLocation) {
  useAuthStore.getState().setLocation(location);
  useCartStore.getState().setDelivery(toCartDelivery(location));
  useAddressStore.setState({ selectedAddressId: location.addressId ?? location.id });
  const current = useAddressStore.getState();
  persist({
    addresses: current.addresses,
    selectedAddressId: location.addressId ?? location.id,
  });
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  isHydrated: false,
  isSyncing: false,
  lastError: null,

  hydrate: () => {
    const persisted = readPersisted();
    set({
      ...persisted,
      isHydrated: true,
    });
    const selected = persisted.addresses.find((row) => row.id === persisted.selectedAddressId);
    if (selected) {
      applyDeliveryLocation(toDeliveryLocation(selected));
    }
  },

  fetchRemote: async () => {
    set({ isSyncing: true, lastError: null });
    try {
      const remote = await fetchSavedAddresses();
      const currentId = get().selectedAddressId;
      const stillOnServer = Boolean(currentId && remote.some((row) => row.id === currentId));
      const keepEphemeral = Boolean(currentId && !isPersistedAddressId(currentId));
      const selectedId = stillOnServer
        ? currentId
        : keepEphemeral
          ? currentId
          : (remote.find((row) => row.isDefault)?.id ?? remote[0]?.id ?? null);
      set({ addresses: remote, selectedAddressId: selectedId, isSyncing: false });
      persist({ addresses: remote, selectedAddressId: selectedId });

      if (selectedId && stillOnServer) {
        const selected = remote.find((row) => row.id === selectedId);
        if (selected) {
          applyDeliveryLocation(toDeliveryLocation(selected));
        }
      } else if (!keepEphemeral && selectedId) {
        const selected = remote.find((row) => row.id === selectedId);
        if (selected) {
          applyDeliveryLocation(toDeliveryLocation(selected));
        }
      }
      return remote;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load saved addresses.';
      set({ isSyncing: false, lastError: message });
      return get().addresses;
    }
  },

  createAddress: async (draft) => {
    const created = await createSavedAddress(draft);
    const addresses = [
      created,
      ...get().addresses.filter((row) => row.id !== created.id).map((row) =>
        created.isDefault ? { ...row, isDefault: false } : row,
      ),
    ];
    set({ addresses, selectedAddressId: created.id, lastError: null });
    persist({ addresses, selectedAddressId: created.id });
    applyDeliveryLocation(toDeliveryLocation(created));
    return created;
  },

  updateAddress: async (id, draft) => {
    const updated = await updateSavedAddress(id, draft);
    const addresses = get().addresses.map((row) => {
      if (row.id === updated.id) return updated;
      return updated.isDefault ? { ...row, isDefault: false } : row;
    });
    set({ addresses });
    persist({ addresses, selectedAddressId: get().selectedAddressId });
    if (get().selectedAddressId === updated.id) {
      applyDeliveryLocation(toDeliveryLocation(updated));
    }
    return updated;
  },

  removeAddress: async (id) => {
    await deleteSavedAddress(id);
    const addresses = get().addresses.filter((row) => row.id !== id);
    const selectedAddressId =
      get().selectedAddressId === id
        ? (addresses.find((row) => row.isDefault)?.id ?? addresses[0]?.id ?? null)
        : get().selectedAddressId;
    set({ addresses, selectedAddressId });
    persist({ addresses, selectedAddressId });
    const selected = addresses.find((row) => row.id === selectedAddressId);
    if (selected) {
      applyDeliveryLocation(toDeliveryLocation(selected));
    }
  },

  makeDefault: async (id) => {
    const updated = await setDefaultSavedAddress(id);
    const addresses = get().addresses.map((row) => ({
      ...row,
      isDefault: row.id === updated.id,
    }));
    set({ addresses, selectedAddressId: updated.id });
    persist({ addresses, selectedAddressId: updated.id });
    applyDeliveryLocation(toDeliveryLocation(updated));
  },

  selectAddress: (address) => {
    applyDeliveryLocation(toDeliveryLocation(address));
  },

  applyResolvedLocation: async (resolved, persistAddress = false) => {
    if (persistAddress && PINCODE_REGEX.test(resolved.postalCode) && resolved.line1.trim()) {
      const saved = await get().createAddress({
        type: 'SHIPPING',
        label: resolved.area || 'Current location',
        line1: resolved.line1 || resolved.formatted,
        line2: resolved.line2,
        city: resolved.city,
        state: resolved.state,
        postalCode: resolved.postalCode,
        landmark: resolved.area,
        latitude: resolved.latitude || null,
        longitude: resolved.longitude || null,
        isDefault: get().addresses.length === 0,
      });
      return toDeliveryLocation(saved);
    }
    const location = resolvedToDeliveryLocation(resolved);
    applyDeliveryLocation(location);
    return location;
  },

  getSelectedLocation: () => {
    const persistedLocation = selectLocation(useAuthStore.getState());
    if (persistedLocation) {
      return persistedLocation;
    }
    const selected = get().addresses.find((row) => row.id === get().selectedAddressId);
    if (selected) {
      return toDeliveryLocation(selected);
    }
    return FALLBACK_DELIVERY_LOCATION;
  },
}));

export const selectSavedAddresses = (state: AddressStore) => state.addresses;
export const selectSelectedAddressId = (state: AddressStore) => state.selectedAddressId;
export const selectAddressesHydrated = (state: AddressStore) => state.isHydrated;
export const selectAddressesSyncing = (state: AddressStore) => state.isSyncing;

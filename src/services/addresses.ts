import { apiClient } from '@/api/client';
import { toApiAddressType } from '@/constants/locations';
import { ensureDevBackendSession } from '@/services/backend-session';
import type { AddressDraft, SavedAddressKind, SavedDeliveryAddress } from '@/types/address';

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type AddressApiRow = {
  id: string;
  type: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  isDefault: boolean;
};

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export function mapSavedAddress(row: AddressApiRow): SavedDeliveryAddress {
  return {
    id: row.id,
    type: (row.type as SavedAddressKind) || 'SHIPPING',
    label: row.label,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    country: row.country ?? 'IN',
    postalCode: row.postalCode,
    landmark: row.landmark,
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    isDefault: row.isDefault,
  };
}

export async function fetchSavedAddresses(): Promise<SavedDeliveryAddress[]> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<AddressApiRow[]>>('/customer/addresses');
  return (payload.data.data ?? []).map(mapSavedAddress);
}

export async function createSavedAddress(draft: AddressDraft): Promise<SavedDeliveryAddress> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<AddressApiRow>>('/customer/addresses', {
    type: toApiAddressType(draft.type),
    label: draft.label,
    line1: draft.line1,
    line2: draft.line2,
    city: draft.city,
    state: draft.state,
    country: draft.country ?? 'IN',
    postalCode: draft.postalCode,
    landmark: draft.landmark,
    latitude: draft.latitude ?? undefined,
    longitude: draft.longitude ?? undefined,
    isDefault: draft.isDefault ?? false,
  });
  return mapSavedAddress(payload.data.data);
}

export async function updateSavedAddress(
  id: string,
  draft: Partial<AddressDraft>,
): Promise<SavedDeliveryAddress> {
  await ensureDevBackendSession('customer');
  const body = {
    ...draft,
    ...(draft.type !== undefined ? { type: toApiAddressType(draft.type) } : {}),
  };
  const payload = await apiClient.patch<Envelope<AddressApiRow>>(`/customer/addresses/${id}`, body);
  return mapSavedAddress(payload.data.data);
}

export async function setDefaultSavedAddress(id: string): Promise<SavedDeliveryAddress> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<AddressApiRow>>(`/customer/addresses/${id}/default`);
  return mapSavedAddress(payload.data.data);
}

export async function deleteSavedAddress(id: string): Promise<void> {
  await ensureDevBackendSession('customer');
  await apiClient.delete(`/customer/addresses/${id}`);
}

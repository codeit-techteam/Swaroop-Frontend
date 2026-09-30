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
  locality?: string | null;
  district?: string | null;
  placeId?: string | null;
  formattedAddress?: string | null;
  accuracyMeters?: number | null;
  source?: string | null;
  isDefault: boolean;
};

/** Geo metadata forwarded to the address book; empty values are omitted. */
const geoFields = (draft: Partial<AddressDraft>) => ({
  ...(draft.locality ? { locality: draft.locality.slice(0, 120) } : {}),
  ...(draft.district ? { district: draft.district.slice(0, 120) } : {}),
  ...(draft.placeId ? { placeId: draft.placeId } : {}),
  ...(draft.formattedAddress ? { formattedAddress: draft.formattedAddress.slice(0, 500) } : {}),
  ...(draft.accuracyMeters != null && Number.isFinite(draft.accuracyMeters)
    ? { accuracyMeters: Math.min(100_000, Math.max(0, Math.round(draft.accuracyMeters))) }
    : {}),
  ...(draft.source ? { source: draft.source } : {}),
});

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
    locality: row.locality ?? null,
    district: row.district ?? null,
    placeId: row.placeId ?? null,
    formattedAddress: row.formattedAddress ?? null,
    accuracyMeters: row.accuracyMeters ?? null,
    source: row.source ?? null,
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
    ...geoFields(draft),
    isDefault: draft.isDefault ?? false,
  });
  return mapSavedAddress(payload.data.data);
}

export async function updateSavedAddress(
  id: string,
  draft: Partial<AddressDraft>,
): Promise<SavedDeliveryAddress> {
  await ensureDevBackendSession('customer');
  const {
    locality: _locality,
    district: _district,
    placeId: _placeId,
    formattedAddress: _formattedAddress,
    accuracyMeters: _accuracyMeters,
    source: _source,
    ...rest
  } = draft;
  const body = {
    ...rest,
    ...geoFields(draft),
    ...(draft.type !== undefined ? { type: toApiAddressType(draft.type) } : {}),
  };
  const payload = await apiClient.patch<Envelope<AddressApiRow>>(`/customer/addresses/${id}`, body);
  return mapSavedAddress(payload.data.data);
}

export async function setDefaultSavedAddress(id: string): Promise<SavedDeliveryAddress> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<AddressApiRow>>(
    `/customer/addresses/${id}/default`,
  );
  return mapSavedAddress(payload.data.data);
}

export async function deleteSavedAddress(id: string): Promise<void> {
  await ensureDevBackendSession('customer');
  await apiClient.delete(`/customer/addresses/${id}`);
}

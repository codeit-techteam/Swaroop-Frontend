import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

export type SellerLocation = {
  id: string;
  name: string;
  city: string;
  state: string;
  warehouse: string;
  status: 'active' | 'inactive';
  availableStockMt: number;
  activeOffers: number;
  activeOrders: number;
  decisionMaker: string;
  decisionMakerRole: string;
};

type BackendLocation = {
  id: string;
  code?: string;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string;
  pincode?: string | null;
  status?: 'active' | 'inactive' | string;
  availableStockMt?: number;
  activeOffers?: number;
  source?: string;
  decisionMaker?: string | null;
  decisionMakerRole?: string | null;
};

type CurrentLocationPayload = {
  current: BackendLocation | null;
  locations: BackendLocation[];
  source?: string;
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function withSellerSession<T>(fn: () => Promise<T>): Promise<T> {
  await ensureDevBackendSession('seller');
  return fn();
}

function mapLocation(row: BackendLocation): SellerLocation {
  const city = row.city?.trim() || '';
  const warehouse = row.name?.trim() || 'Warehouse';
  return {
    id: row.id,
    name: city || warehouse,
    city: city || warehouse,
    state: row.state ?? '',
    warehouse,
    status: row.status === 'inactive' ? 'inactive' : 'active',
    availableStockMt: num(row.availableStockMt),
    activeOffers: num(row.activeOffers),
    activeOrders: 0,
    decisionMaker: row.decisionMaker?.trim() || '',
    decisionMakerRole: row.decisionMakerRole?.trim() || '',
  };
}

function locationsApiError(error: unknown, fallback: string): Error {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    if (!error.response) {
      return new Error('Unable to reach PetroTrade API. Confirm the backend is running.');
    }
    const message = error.response.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return new Error(message);
    }
    if (Array.isArray(message) && message[0]) {
      return new Error(String(message[0]));
    }
    if (error.response.status === 429) {
      return new Error('Too many location requests. Please retry shortly.');
    }
  }
  if (error instanceof Error && error.message) return error;
  return new Error(fallback);
}

export async function fetchSellerLocations(): Promise<SellerLocation[]> {
  return withSellerSession(async () => {
    try {
      const response = await apiClient.get<Envelope<BackendLocation[]>>('/seller/locations');
      const rows = Array.isArray(response.data.data) ? response.data.data : [];
      return rows.map(mapLocation);
    } catch (error) {
      throw locationsApiError(error, 'Unable to load operating locations.');
    }
  });
}

export async function fetchCurrentSellerLocation(): Promise<{
  current: SellerLocation | null;
  locations: SellerLocation[];
  source?: string;
}> {
  return withSellerSession(async () => {
    try {
      const response = await apiClient.get<Envelope<CurrentLocationPayload>>(
        '/seller/locations/current',
      );
      const payload = response.data.data;
      const locations = (payload?.locations ?? []).map(mapLocation);
      const current = payload?.current ? mapLocation(payload.current) : (locations[0] ?? null);
      return { current, locations, source: payload?.source };
    } catch (error) {
      try {
        const locations = await fetchSellerLocations();
        return {
          current: locations[0] ?? null,
          locations,
          source: locations.length ? 'list-fallback' : 'empty',
        };
      } catch {
        throw locationsApiError(error, 'Unable to load current location.');
      }
    }
  });
}

export type SaveSellerGeoLocationInput = {
  latitude: number;
  longitude: number;
  name?: string;
  addressLine?: string;
  addressLine2?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  placeId?: string | null;
  formattedAddress?: string;
  accuracyMeters?: number | null;
  source?: 'AUTOCOMPLETE' | 'GPS' | 'MAP_PIN' | 'MANUAL';
};

const GEO_TEXT_LIMITS: [keyof SaveSellerGeoLocationInput, number][] = [
  ['name', 120],
  ['addressLine', 200],
  ['addressLine2', 200],
  ['landmark', 120],
  ['locality', 120],
  ['city', 80],
  ['district', 120],
  ['state', 80],
  ['pincode', 12],
  ['country', 2],
  ['placeId', 300],
  ['formattedAddress', 500],
  ['source', 20],
];

/** Save a confirmed operating / pickup location (deduped server-side). */
export async function saveSellerLocationFromGeo(input: SaveSellerGeoLocationInput) {
  return withSellerSession(async () => {
    const body: Record<string, string | number> = {
      latitude: input.latitude,
      longitude: input.longitude,
    };
    for (const [key, max] of GEO_TEXT_LIMITS) {
      const value = input[key];
      if (typeof value === 'string' && value.trim()) body[key] = value.trim().slice(0, max);
    }
    if (input.accuracyMeters != null && Number.isFinite(input.accuracyMeters)) {
      body.accuracyMeters = Math.min(100_000, Math.max(0, Math.round(input.accuracyMeters)));
    }
    try {
      const response = await apiClient.post<Envelope<CurrentLocationPayload>>(
        '/seller/locations/from-geo',
        body,
      );
      const payload = response.data.data;
      return {
        current: payload?.current ? mapLocation(payload.current) : null,
        locations: (payload?.locations ?? []).map(mapLocation),
      };
    } catch (error) {
      throw locationsApiError(error, 'Unable to save this location.');
    }
  });
}

export async function setCurrentSellerLocation(warehouseId: string) {
  return withSellerSession(async () => {
    const response = await apiClient.post<Envelope<CurrentLocationPayload>>(
      '/seller/locations/current',
      { warehouseId },
    );
    const payload = response.data.data;
    return {
      current: payload?.current ? mapLocation(payload.current) : null,
      locations: (payload?.locations ?? []).map(mapLocation),
    };
  });
}

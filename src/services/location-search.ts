import { apiClient } from '@/api/client';
import {
  isAbortError,
  toLocationError,
  type LocationServiceConfig,
  type LocationSuggestion,
  type NormalizedLocation,
} from '@/services/location-search-core';

export * from '@/services/location-search-core';

/**
 * Client for the shared backend geo service. Google Places / Geocoding are
 * only ever called server-side, so no Maps key ships inside the app binary.
 */

type Envelope<T> = { success?: boolean; data: T; message?: string };

const DISABLED_CONFIG: LocationServiceConfig = {
  provider: 'none',
  autocompleteEnabled: false,
  reverseGeocodeEnabled: false,
  regionCode: 'IN',
  minQueryLength: 2,
  attribution: null,
};

let configPromise: Promise<LocationServiceConfig> | null = null;

export function fetchLocationConfig(): Promise<LocationServiceConfig> {
  if (!configPromise) {
    configPromise = apiClient
      .get<Envelope<LocationServiceConfig>>('/locations/config')
      .then((response) => response.data.data ?? DISABLED_CONFIG)
      .catch(() => {
        configPromise = null;
        return DISABLED_CONFIG;
      });
  }
  return configPromise;
}

export async function searchLocations(
  input: string,
  options: {
    sessionToken: string;
    near?: { latitude: number; longitude: number } | null;
    signal?: AbortSignal;
  },
): Promise<LocationSuggestion[]> {
  try {
    const response = await apiClient.get<Envelope<LocationSuggestion[]>>(
      '/locations/autocomplete',
      {
        params: {
          input,
          sessionToken: options.sessionToken,
          ...(options.near ? { lat: options.near.latitude, lng: options.near.longitude } : {}),
        },
        signal: options.signal,
      },
    );
    return response.data.data ?? [];
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toLocationError(error, 'AUTOCOMPLETE_FAILED');
  }
}

export async function fetchPlaceLocation(
  placeId: string,
  options: { sessionToken?: string | null; name?: string; signal?: AbortSignal },
): Promise<NormalizedLocation> {
  try {
    const response = await apiClient.get<Envelope<NormalizedLocation>>(
      `/locations/places/${encodeURIComponent(placeId)}`,
      {
        params: {
          ...(options.sessionToken ? { sessionToken: options.sessionToken } : {}),
          ...(options.name ? { name: options.name.slice(0, 120) } : {}),
        },
        signal: options.signal,
      },
    );
    return response.data.data;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toLocationError(error, 'PLACE_NOT_FOUND');
  }
}

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
  source: 'GPS' | 'MAP_PIN',
  signal?: AbortSignal,
): Promise<NormalizedLocation> {
  try {
    const response = await apiClient.get<Envelope<NormalizedLocation>>(
      '/locations/reverse-geocode',
      {
        params: { lat: latitude, lng: longitude, source },
        signal,
      },
    );
    return response.data.data;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toLocationError(error, 'GEOCODING_FAILED');
  }
}

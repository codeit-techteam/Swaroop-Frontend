import { isAxiosError, isCancel } from 'axios';

/**
 * Shared-geo-service contract (`/locations/*` on the backend). Pure module —
 * no React Native imports — so it can be unit tested under plain Node.
 */

export type LocationCaptureSource = 'AUTOCOMPLETE' | 'GPS' | 'MAP_PIN';
export type AddressCaptureSource = LocationCaptureSource | 'PINCODE' | 'MANUAL';

export type NormalizedLocation = {
  placeId: string | null;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  countryCode: string;
  source: LocationCaptureSource;
};

export type LocationSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
  types: string[];
  distanceMeters: number | null;
};

export type LocationServiceConfig = {
  provider: 'google' | 'none';
  autocompleteEnabled: boolean;
  reverseGeocodeEnabled: boolean;
  regionCode: string;
  minQueryLength: number;
  attribution: string | null;
};

export type LocationErrorCode =
  | 'LOCATION_PERMISSION_DENIED'
  | 'LOCATION_UNAVAILABLE'
  | 'LOCATION_TIMEOUT'
  | 'GPS_DISABLED'
  | 'LOCATION_SERVICE_NOT_CONFIGURED'
  | 'GOOGLE_API_UNAVAILABLE'
  | 'AUTOCOMPLETE_FAILED'
  | 'PLACE_NOT_FOUND'
  | 'GEOCODING_FAILED'
  | 'INVALID_COORDINATES'
  | 'LOCATION_OUTSIDE_SERVICE_AREA'
  | 'LOCATION_RATE_LIMITED'
  | 'NETWORK_ERROR';

export const LOCATION_ERROR_MESSAGES: Record<LocationErrorCode, string> = {
  LOCATION_PERMISSION_DENIED:
    'Location permission is off. Allow it in Settings, or search for your address instead.',
  LOCATION_UNAVAILABLE:
    "We couldn't read your location right now. Search for your address instead.",
  LOCATION_TIMEOUT:
    'Finding your location is taking too long. Try again or search for your address.',
  GPS_DISABLED: 'Turn on Location Services to use your current location.',
  LOCATION_SERVICE_NOT_CONFIGURED:
    'Address search is temporarily unavailable. Please enter your address manually.',
  GOOGLE_API_UNAVAILABLE:
    'Address search is temporarily unavailable. Please try again or enter your address manually.',
  AUTOCOMPLETE_FAILED: 'Unable to load address suggestions right now. Please try again.',
  PLACE_NOT_FOUND: 'We could not find that place. Please pick another suggestion.',
  GEOCODING_FAILED:
    'Unable to resolve an address for this location. Please search for your address manually.',
  INVALID_COORDINATES: 'The selected location coordinates are invalid.',
  LOCATION_OUTSIDE_SERVICE_AREA:
    'This location is outside India. Please choose an Indian delivery address.',
  LOCATION_RATE_LIMITED: 'Too many address lookups. Please wait a moment and try again.',
  NETWORK_ERROR: 'You appear to be offline. Check your connection and try again.',
};

export class LocationServiceError extends Error {
  readonly code: LocationErrorCode;

  constructor(code: LocationErrorCode, message?: string) {
    super(message ?? LOCATION_ERROR_MESSAGES[code]);
    this.name = 'LocationServiceError';
    this.code = code;
  }
}

const SERVER_CODES = new Set<string>([
  'LOCATION_SERVICE_NOT_CONFIGURED',
  'GOOGLE_API_UNAVAILABLE',
  'AUTOCOMPLETE_FAILED',
  'PLACE_NOT_FOUND',
  'GEOCODING_FAILED',
  'INVALID_COORDINATES',
  'LOCATION_OUTSIDE_SERVICE_AREA',
  'LOCATION_RATE_LIMITED',
]);

export function isAbortError(error: unknown): boolean {
  return (
    isCancel(error) ||
    (error instanceof Error && (error.name === 'AbortError' || error.name === 'CanceledError'))
  );
}

export function toLocationError(error: unknown, fallback: LocationErrorCode): LocationServiceError {
  if (error instanceof LocationServiceError) return error;
  if (isAxiosError(error)) {
    if (!error.response) return new LocationServiceError('NETWORK_ERROR');
    const body = error.response.data as { code?: unknown; message?: unknown } | undefined;
    const code = typeof body?.code === 'string' ? body.code : '';
    if (SERVER_CODES.has(code)) {
      const message = typeof body?.message === 'string' ? body.message : undefined;
      return new LocationServiceError(code as LocationErrorCode, message);
    }
    if (error.response.status === 429) return new LocationServiceError('LOCATION_RATE_LIMITED');
  }
  return new LocationServiceError(fallback);
}

export function isLocationServiceDown(error: unknown): boolean {
  return (
    error instanceof LocationServiceError &&
    (error.code === 'LOCATION_SERVICE_NOT_CONFIGURED' || error.code === 'GOOGLE_API_UNAVAILABLE')
  );
}

/**
 * Autocomplete billing-session token. Only groups requests for Google
 * billing — not a security credential — so Math.random is acceptable where
 * the runtime has no Web Crypto (Hermes).
 */
export function createSessionToken(): string {
  const cryptoApi = (globalThis as { crypto?: Crypto }).crypto;
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null || !Number.isFinite(meters)) return '';
  if (meters < 1000) return `${Math.max(1, Math.round(meters / 10) * 10)} m`;
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/** GPS fixes worse than this are flagged for the user to verify. */
export const LOW_ACCURACY_THRESHOLD_METERS = 100;

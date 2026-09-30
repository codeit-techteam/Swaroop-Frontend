import { Linking } from 'react-native';

import * as Location from 'expo-location';

import { formatDeliveryLabel, PINCODE_REGEX, stateCodeFromName } from '@/constants/locations';
import {
  LOCATION_ERROR_MESSAGES,
  reverseGeocodeLocation,
  type NormalizedLocation,
} from '@/services/location-search';
import type { LocationAccessCode, PincodeLocality, ResolvedGeoAddress } from '@/types/address';
import { LocationAccessError } from '@/types/address';
import { logger } from '@/utils/logger';

const GPS_TIMEOUT_MS = 12_000;
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;
const GEOCODER_TIMEOUT_MS = 8_000;

const withTimeout = async <T>(
  promise: Promise<T>,
  ms: number,
  code: LocationAccessCode,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new LocationAccessError(code, LOCATION_ERROR_MESSAGES.LOCATION_TIMEOUT));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const firstNonEmpty = (...values: (string | null | undefined)[]): string => {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return '';
};

/** True when the string is mostly Latin letters/digits (English place names). */
const isLatinPlaceName = (value?: string | null): boolean => {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return /^[\p{Script=Latin}\d\s.'’\-()/]+$/u.test(trimmed);
};

const preferEnglishName = (primary?: string | null, fallback?: string | null): string => {
  const a = primary?.trim() ?? '';
  const b = fallback?.trim() ?? '';
  if (a && isLatinPlaceName(a)) return a;
  if (b && isLatinPlaceName(b)) return b;
  return a || b;
};

const buildFormatted = (parts: {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  area?: string;
}): string =>
  formatDeliveryLabel({
    city: parts.city,
    state: parts.state,
    pincode: parts.postalCode,
    area: parts.area,
  });

/** Map the shared backend location shape onto the app's address shape. */
export function normalizedToResolved(
  location: NormalizedLocation,
  accuracyMeters: number | null = null,
): ResolvedGeoAddress {
  const area = location.locality || location.addressLine2;
  const line1 = location.addressLine1 || location.name || area || location.city;
  return {
    line1,
    line2: location.addressLine2 || undefined,
    city: location.city,
    state: location.state,
    stateCode: location.stateCode || stateCodeFromName(location.state),
    postalCode: location.postalCode,
    country: location.countryCode || 'IN',
    landmark: location.landmark || undefined,
    area: area || undefined,
    latitude: location.latitude,
    longitude: location.longitude,
    formatted: buildFormatted({
      line1,
      city: location.city,
      state: location.state,
      postalCode: location.postalCode,
      area,
    }),
    source: 'google',
    name: location.name || undefined,
    district: location.district || undefined,
    placeId: location.placeId,
    formattedAddress: location.formattedAddress || undefined,
    accuracyMeters,
    captureSource: location.source,
  };
}

/** Google reverse geocoding through the backend proxy (server-side key). */
async function reverseGeocodeBackend(
  latitude: number,
  longitude: number,
  source: 'GPS' | 'MAP_PIN',
): Promise<ResolvedGeoAddress | null> {
  try {
    const location = await withTimeout(
      reverseGeocodeLocation(latitude, longitude, source),
      GEOCODER_TIMEOUT_MS,
      'TIMEOUT',
    );
    if (!location.city && !location.postalCode) return null;
    return normalizedToResolved(location);
  } catch (error) {
    logger.warn('Backend reverse geocode failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
}

async function reverseGeocodeDevice(
  latitude: number,
  longitude: number,
): Promise<ResolvedGeoAddress | null> {
  try {
    const [place] = await withTimeout(
      Location.reverseGeocodeAsync({ latitude, longitude }),
      GEOCODER_TIMEOUT_MS,
      'TIMEOUT',
    );
    if (!place) return null;

    const city = firstNonEmpty(place.city, place.subregion, place.district);
    const state = firstNonEmpty(place.region, place.subregion);
    const postalCode = (place.postalCode ?? '').replace(/\D/g, '').slice(0, 6);
    const area = firstNonEmpty(place.district, place.name);
    const line1 = firstNonEmpty(
      [place.streetNumber, place.street].filter(Boolean).join(' '),
      place.name,
      area,
      city,
    );

    if (!city && !postalCode) return null;

    return {
      line1,
      line2: area && area !== city ? area : undefined,
      city: city || 'India',
      state: state || '',
      stateCode: stateCodeFromName(state),
      postalCode,
      country: place.isoCountryCode ?? 'IN',
      area,
      latitude,
      longitude,
      formatted: buildFormatted({ line1, city: city || 'India', state, postalCode, area }),
      source: 'device',
    };
  } catch (error) {
    logger.warn('Device reverse geocode failed', error);
    return null;
  }
}

export async function lookupPincode(pincode: string): Promise<PincodeLocality[]> {
  const pin = pincode.replace(/\D/g, '').slice(0, 6);
  if (!PINCODE_REGEX.test(pin)) {
    return [];
  }

  try {
    const response = await withTimeout(
      fetch(`https://api.postalpincode.in/pincode/${pin}`),
      GEOCODER_TIMEOUT_MS,
      'TIMEOUT',
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      Status?: string;
      PostOffice?: {
        Name?: string;
        District?: string;
        State?: string;
        Pincode?: string;
        Block?: string;
      }[];
    }[];
    const offices = payload[0]?.PostOffice ?? [];
    return offices
      .map((office) => ({
        name: firstNonEmpty(office.Name, office.Block),
        city: firstNonEmpty(office.District, office.Block, office.Name),
        state: firstNonEmpty(office.State),
        pincode: firstNonEmpty(office.Pincode, pin),
        district: office.District,
      }))
      .filter((entry) => entry.city && entry.state);
  } catch (error) {
    logger.warn('Pincode lookup failed', error);
    return [];
  }
}

export async function resolvePincodeAddress(pincode: string): Promise<ResolvedGeoAddress | null> {
  const localities = await lookupPincode(pincode);
  const first = localities[0];
  if (!first) return null;

  return {
    line1: first.name || first.city,
    city: first.city,
    state: first.state,
    stateCode: stateCodeFromName(first.state),
    postalCode: first.pincode,
    country: 'IN',
    area: first.name,
    latitude: 0,
    longitude: 0,
    formatted: formatDeliveryLabel({
      city: first.city,
      state: first.state,
      pincode: first.pincode,
      area: first.name,
    }),
    source: 'pincode',
    district: first.district,
    captureSource: 'PINCODE',
  };
}

export async function requestLocationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === 'granted') {
    return 'granted';
  }
  const next = await Location.requestForegroundPermissionsAsync();
  return next.status;
}

export async function openLocationSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function reverseGeocodeCoords(
  latitude: number,
  longitude: number,
  source: 'GPS' | 'MAP_PIN' = 'GPS',
): Promise<ResolvedGeoAddress> {
  const fromBackend = await reverseGeocodeBackend(latitude, longitude, source);
  if (fromBackend) return { ...fromBackend, latitude, longitude };

  const geocoded = await reverseGeocodeDevice(latitude, longitude);
  if (!geocoded) {
    throw new LocationAccessError(
      'GEOCODE_FAILED',
      "We found your location but couldn't resolve an address. Search for your address or enter a pincode.",
    );
  }
  const resolved: ResolvedGeoAddress = { ...geocoded, captureSource: source };

  if (PINCODE_REGEX.test(resolved.postalCode)) {
    const fromPin = await resolvePincodeAddress(resolved.postalCode);
    if (fromPin) {
      // Pincode API returns English; prefer it when device geocode used a local script
      // (e.g. "কল্যাণী" → "Kalyani").
      const city = preferEnglishName(resolved.city, fromPin.city);
      const state = preferEnglishName(resolved.state, fromPin.state);
      const line1 = preferEnglishName(resolved.line1, fromPin.line1);
      const area = preferEnglishName(resolved.area, fromPin.area);
      return {
        ...resolved,
        city,
        state,
        line1,
        area,
        postalCode: resolved.postalCode || fromPin.postalCode,
        formatted: buildFormatted({
          line1,
          city,
          state,
          postalCode: resolved.postalCode || fromPin.postalCode,
          area,
        }),
      };
    }
    return resolved;
  }

  const fromPin = resolved.postalCode ? await resolvePincodeAddress(resolved.postalCode) : null;
  if (fromPin) {
    return {
      ...resolved,
      ...fromPin,
      latitude,
      longitude,
      source: resolved.source,
      captureSource: source,
    };
  }

  return resolved;
}

export type DevicePosition = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
};

/** One fresh high-accuracy fix, falling back to a recent last-known position. */
export async function getCurrentDevicePosition(): Promise<DevicePosition> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new LocationAccessError('SERVICES_DISABLED', LOCATION_ERROR_MESSAGES.GPS_DISABLED);
  }

  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    throw new LocationAccessError(
      'PERMISSION_DENIED',
      LOCATION_ERROR_MESSAGES.LOCATION_PERMISSION_DENIED,
    );
  }

  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: LAST_KNOWN_MAX_AGE_MS,
    requiredAccuracy: 150,
  }).catch(() => null);

  const current = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    }),
    GPS_TIMEOUT_MS,
    'TIMEOUT',
  ).catch(async (error) => {
    if (lastKnown) return lastKnown;
    if (error instanceof LocationAccessError) throw error;
    throw new LocationAccessError('UNAVAILABLE', LOCATION_ERROR_MESSAGES.LOCATION_UNAVAILABLE);
  });

  const { latitude, longitude, accuracy } = current.coords;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    throw new LocationAccessError('UNAVAILABLE', LOCATION_ERROR_MESSAGES.LOCATION_UNAVAILABLE);
  }
  return {
    latitude,
    longitude,
    accuracyMeters: accuracy != null && Number.isFinite(accuracy) ? Math.round(accuracy) : null,
  };
}

export async function fetchCurrentDeliveryAddress(): Promise<ResolvedGeoAddress> {
  const position = await getCurrentDevicePosition();
  const resolved = await reverseGeocodeCoords(position.latitude, position.longitude, 'GPS');
  return { ...resolved, accuracyMeters: position.accuracyMeters, captureSource: 'GPS' };
}

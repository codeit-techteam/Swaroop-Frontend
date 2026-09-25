import { Linking } from 'react-native';

import * as Location from 'expo-location';

import { formatDeliveryLabel, PINCODE_REGEX, stateCodeFromName } from '@/constants/locations';
import { appConfig } from '@/config/env';
import type {
  LocationAccessCode,
  PincodeLocality,
  ResolvedGeoAddress,
} from '@/types/address';
import { LocationAccessError } from '@/types/address';
import { logger } from '@/utils/logger';

const GPS_TIMEOUT_MS = 12_000;
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;
const GEOCODER_TIMEOUT_MS = 8_000;

const isPlaceholderMapsKey = (key: string): boolean =>
  !key || key.includes('placeholder') || key === 'preview-placeholder';

const withTimeout = async <T>(promise: Promise<T>, ms: number, code: LocationAccessCode): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new LocationAccessError(code, 'Taking longer than expected to find your location.'));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const firstNonEmpty = (...values: Array<string | null | undefined>): string => {
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

async function reverseGeocodeGoogle(
  latitude: number,
  longitude: number,
): Promise<ResolvedGeoAddress | null> {
  const key = appConfig.googleMapsApiKey;
  if (isPlaceholderMapsKey(key)) {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${encodeURIComponent(key)}`;
    const response = await withTimeout(fetch(url), GEOCODER_TIMEOUT_MS, 'TIMEOUT');
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      status?: string;
      results?: Array<{
        formatted_address?: string;
        address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
      }>;
    };
    const result = payload.results?.[0];
    if (!result) return null;

    const pick = (type: string, short = false) => {
      const component = result.address_components?.find((entry) => entry.types.includes(type));
      return short ? component?.short_name : component?.long_name;
    };

    const city = firstNonEmpty(
      pick('locality'),
      pick('administrative_area_level_2'),
      pick('sublocality_level_1'),
    );
    const state = firstNonEmpty(pick('administrative_area_level_1'));
    const postalCode = firstNonEmpty(pick('postal_code'));
    const area = firstNonEmpty(pick('sublocality_level_1'), pick('neighborhood'), pick('sublocality'));
    const line1 = firstNonEmpty(
      [pick('street_number'), pick('route')].filter(Boolean).join(' '),
      pick('premise'),
      result.formatted_address?.split(',')[0],
      area,
      city,
    );

    if (!city && !postalCode) return null;

    return {
      line1,
      line2: area && area !== city ? area : undefined,
      city: city || 'India',
      state: state || '',
      stateCode: pick('administrative_area_level_1', true) ?? stateCodeFromName(state),
      postalCode,
      country: pick('country', true) ?? 'IN',
      area,
      latitude,
      longitude,
      formatted: buildFormatted({ line1, city: city || 'India', state, postalCode, area }),
      source: 'google',
    };
  } catch (error) {
    logger.warn('Google reverse geocode failed', error);
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
    const payload = (await response.json()) as Array<{
      Status?: string;
      PostOffice?: Array<{
        Name?: string;
        District?: string;
        State?: string;
        Pincode?: string;
        Block?: string;
      }>;
    }>;
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
): Promise<ResolvedGeoAddress> {
  const resolved =
    (await reverseGeocodeDevice(latitude, longitude)) ??
    (await reverseGeocodeGoogle(latitude, longitude));

  if (!resolved) {
    throw new LocationAccessError(
      'GEOCODE_FAILED',
      'Found your GPS point but could not resolve a delivery address. Enter a pincode instead.',
    );
  }

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
    };
  }

  return resolved;
}

export async function fetchCurrentDeliveryAddress(): Promise<ResolvedGeoAddress> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new LocationAccessError(
      'SERVICES_DISABLED',
      'Turn on Location Services to detect your delivery pincode.',
    );
  }

  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    throw new LocationAccessError(
      'PERMISSION_DENIED',
      'Allow location access to auto-detect your delivery address.',
    );
  }

  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: LAST_KNOWN_MAX_AGE_MS,
    requiredAccuracy: 150,
  }).catch(() => null);

  const current = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }),
    GPS_TIMEOUT_MS,
    'TIMEOUT',
  ).catch(async (error) => {
    if (lastKnown) return lastKnown;
    if (error instanceof LocationAccessError) throw error;
    throw new LocationAccessError(
      'UNAVAILABLE',
      'Unable to read GPS right now. Search a pincode or pick a saved address.',
    );
  });

  const { latitude, longitude } = current.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new LocationAccessError('UNAVAILABLE', 'GPS coordinates were invalid.');
  }

  return reverseGeocodeCoords(latitude, longitude);
}

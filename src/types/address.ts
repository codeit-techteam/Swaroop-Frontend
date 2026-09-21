export type SavedAddressKind =
  | 'WAREHOUSE'
  | 'OFFICE'
  | 'FACTORY'
  | 'SHIPPING'
  | 'BILLING'
  | 'REGISTERED'
  | 'OTHER';

export type AddressSource = 'saved' | 'gps' | 'pincode' | 'preset' | 'manual';

export type SavedDeliveryAddress = {
  id: string;
  type: SavedAddressKind;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  localOnly?: boolean;
};

export type AddressDraft = {
  type?: SavedAddressKind;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
};

export type ResolvedGeoAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  landmark?: string;
  area?: string;
  latitude: number;
  longitude: number;
  formatted: string;
  source: 'device' | 'google' | 'pincode' | 'nominatim';
};

export type PincodeLocality = {
  name: string;
  city: string;
  state: string;
  pincode: string;
  district?: string;
};

export type LocationAccessCode =
  | 'PERMISSION_DENIED'
  | 'SERVICES_DISABLED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'GEOCODE_FAILED';

export class LocationAccessError extends Error {
  readonly code: LocationAccessCode;

  constructor(code: LocationAccessCode, message: string) {
    super(message);
    this.name = 'LocationAccessError';
    this.code = code;
  }
}

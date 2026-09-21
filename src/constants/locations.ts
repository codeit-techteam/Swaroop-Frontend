import type { DeliveryLocation } from '@/types/home';

export const INDIAN_STATE_CODES: Record<string, string> = {
  'andaman and nicobar islands': 'AN',
  'andhra pradesh': 'AP',
  'arunachal pradesh': 'AR',
  assam: 'AS',
  bihar: 'BR',
  chandigarh: 'CH',
  chhattisgarh: 'CG',
  delhi: 'DL',
  'nct of delhi': 'DL',
  goa: 'GA',
  gujarat: 'GJ',
  haryana: 'HR',
  'himachal pradesh': 'HP',
  'jammu and kashmir': 'JK',
  jharkhand: 'JH',
  karnataka: 'KA',
  kerala: 'KL',
  ladakh: 'LA',
  lakshadweep: 'LD',
  'madhya pradesh': 'MP',
  maharashtra: 'MH',
  manipur: 'MN',
  meghalaya: 'ML',
  mizoram: 'MZ',
  nagaland: 'NL',
  odisha: 'OD',
  orissa: 'OD',
  puducherry: 'PY',
  pondicherry: 'PY',
  punjab: 'PB',
  rajasthan: 'RJ',
  sikkim: 'SK',
  'tamil nadu': 'TN',
  telangana: 'TS',
  tripura: 'TR',
  'uttar pradesh': 'UP',
  uttarakhand: 'UK',
  'west bengal': 'WB',
};

export const STATE_CODE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(INDIAN_STATE_CODES).map(([name, code]) => [code, titleCase(name)]),
);

function titleCase(value: string): string {
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function stateCodeFromName(state?: string | null): string {
  const trimmed = (state ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return INDIAN_STATE_CODES[trimmed.toLowerCase()] ?? trimmed.slice(0, 2).toUpperCase();
}

export function formatDeliveryLabel(input: {
  city: string;
  state?: string;
  pincode?: string;
  area?: string;
}): string {
  const city = input.city.trim();
  const area = input.area?.trim();
  const code = stateCodeFromName(input.state);
  const pin = (input.pincode ?? '').replace(/\D/g, '').slice(0, 6);
  const locality = area && area.toLowerCase() !== city.toLowerCase() ? `${area}, ${city}` : city;
  const region = [code, pin].filter(Boolean).join(' ');
  return region ? `${locality}, ${region}` : locality;
}

export const ADDRESS_KIND_OPTIONS = [
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'FACTORY', label: 'Factory' },
  { value: 'SHIPPING', label: 'Shipping' },
  { value: 'OTHER', label: 'Other' },
] as const;

export function addressKindLabel(type: string): string {
  const match = ADDRESS_KIND_OPTIONS.find((option) => option.value === type);
  if (match) return match.label;
  if (type === 'REGISTERED') return 'Registered';
  if (type === 'BILLING') return 'Billing';
  return 'Address';
}

export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export const GPS_LOCATION_ID = 'gps-current';

export function isPersistedAddressId(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

export const FALLBACK_DELIVERY_LOCATION: DeliveryLocation = {
  id: 'loc-mumbai',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  label: 'Mumbai, MH 400001',
  source: 'preset',
};

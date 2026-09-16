export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const GST_KNOW_MORE_URL = 'https://www.gst.gov.in/';
export const GST_BOOK_MEETING_URL = 'https://www.gst.gov.in/help/contactus';

/** Official GSTIN state codes used to decode the first two digits. */
export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
};

export type GstParseResult = {
  isValid: boolean;
  gstNumber: string;
  stateCode: string;
  state: string;
  pan: string;
  error?: string;
};

export function normalizeGstin(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase();
}

export function extractPanFromGstin(gstin: string): string {
  const gstNumber = normalizeGstin(gstin);
  return gstNumber.length === 15 ? gstNumber.slice(2, 12) : '';
}

export function parseGstin(value: string): GstParseResult {
  const gstNumber = normalizeGstin(value);

  if (!gstNumber) {
    return {
      isValid: false,
      gstNumber,
      stateCode: '',
      state: '',
      pan: '',
      error: 'Enter a GST number to validate',
    };
  }

  if (!GSTIN_REGEX.test(gstNumber)) {
    return {
      isValid: false,
      gstNumber,
      stateCode: gstNumber.slice(0, 2),
      state: '',
      pan: extractPanFromGstin(gstNumber),
      error: 'Enter a valid 15-character GST number',
    };
  }

  const stateCode = gstNumber.slice(0, 2);
  const pan = gstNumber.slice(2, 12);
  const state = GST_STATE_CODES[stateCode];

  if (!state) {
    return {
      isValid: false,
      gstNumber,
      stateCode,
      state: '',
      pan,
      error: 'GST state code is not recognised',
    };
  }

  return {
    isValid: true,
    gstNumber,
    stateCode,
    state,
    pan,
  };
}

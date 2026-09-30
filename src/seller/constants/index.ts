import type {
  SellerCompany,
  SellerDocument,
  SellerMenuSection,
  SellerStepId,
} from '@/seller/types';

export const SELLER_DEMO_MOBILE = '8240890242';
export const SELLER_DEMO_OTP = '123456';
export const SELLER_DEMO_NAME = 'Karan Veer';
export const SELLER_DEMO_EMAIL = 'seller@test.local';
export const SELLER_DEMO_PASSWORD = 'Test@12345';
export const SELLER_RESEND_SECONDS = 45;
export const SELLER_UPLOAD_DURATION_MS = 900;

export const SELLER_ENTITY_TYPE_OPTIONS = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
] as const;

export const SELLER_NATURE_OF_BUSINESS_OPTIONS = [
  'Industrial Chemicals',
  'Petrochemicals',
  'Lubricants',
  'Polymers',
  'Logistics',
  'Trading',
] as const;

export const SELLER_STATES = {
  'West Bengal': ['Kolkata', 'Howrah', 'Haldia', 'Durgapur'],
  Maharashtra: ['Mumbai', 'Pune', 'Navi Mumbai', 'Nagpur'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad'],
} as const;

export const SELLER_STATE_OPTIONS = Object.keys(SELLER_STATES);

export const EMPTY_SELLER_COMPANY: SellerCompany = {
  companyName: '',
  gst: '',
  pan: '',
  gstVerified: false,
  gstStateCode: '',
  gstState: '',
  entityType: '',
  businessEmail: '',
  mobile: '',
  address: '',
  state: '',
  city: '',
  pincode: '',
  natureOfBusiness: '',
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
};

export const SELLER_INITIAL_DOCUMENTS: SellerDocument[] = [
  {
    id: 'gst',
    title: 'GST Certificate',
    subtitle: 'Upload GST registration proof',
    required: true,
    status: 'idle',
    progress: 0,
  },
  {
    id: 'pan',
    title: 'PAN Card',
    subtitle: 'Upload company PAN document',
    required: true,
    status: 'idle',
    progress: 0,
  },
  {
    id: 'aadhaar',
    title: 'Aadhaar',
    subtitle: 'Upload authorized person Aadhaar',
    required: true,
    status: 'idle',
    progress: 0,
  },
  {
    id: 'cancelledCheque',
    title: 'Cancelled Cheque',
    subtitle: 'Upload bank account cheque copy',
    required: true,
    status: 'idle',
    progress: 0,
  },
];

export const SELLER_STEPPER_LABELS: Record<SellerStepId, string> = {
  company: 'Company',
  verification: 'Verification',
  review: 'Review',
};

export const SELLER_MENU_SECTIONS: {
  id: SellerMenuSection;
  label: string;
  blurb: string;
}[] = [
  { id: 'dashboard', label: 'Dashboard', blurb: 'Daily activity overview' },
  { id: 'inventory', label: 'Inventory', blurb: 'Track stock and availability' },
  { id: 'products', label: 'Products', blurb: 'Manage catalog and pricing' },
  { id: 'orders', label: 'Orders', blurb: 'Review order pipeline' },
  { id: 'customers', label: 'Customers', blurb: 'Buyer relationships and accounts' },
  { id: 'settlements', label: 'Settlements', blurb: 'Escrow-protected payouts' },
  { id: 'warehouse', label: 'Warehouse', blurb: 'Storage and inward operations' },
  { id: 'dispatch', label: 'Dispatch', blurb: 'Shipment scheduling' },
  { id: 'analytics', label: 'Analytics', blurb: 'Business KPIs and insights' },
  { id: 'support', label: 'Support', blurb: 'Tickets and escalation desk' },
  { id: 'settings', label: 'Settings', blurb: 'Team and account preferences' },
];

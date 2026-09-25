import type { BankAccount, SavedAddress, TaxDocument } from '@/types/profile';

export const PROFILE_APP_VERSION = 'v1.0.0';

export const PROFILE_APP_NAME = 'PetroTrade Enterprise';

export const PROFILE_COPYRIGHT = '© PetroTrade Industrial Markets';

const formatComplianceValidTill = (): string => {
  const now = new Date();
  const year = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  return `Dec ${year}`;
};

export const getComplianceValidTillLabel = (): string =>
  `Valid until ${formatComplianceValidTill()}`;

export const buildSavedAddresses = (params: {
  businessAddress: string;
  city: string;
  state: string;
  pincode: string;
  companyName: string;
}): SavedAddress[] => {
  const { businessAddress, city, state, pincode, companyName } = params;
  const baseLine = businessAddress || `${city}, ${state}`;

  return [
    {
      id: 'addr-warehouse',
      type: 'warehouse',
      label: 'Primary Warehouse',
      addressLine: baseLine,
      city,
      state,
      pincode,
      isPrimary: true,
    },
    {
      id: 'addr-office',
      type: 'office',
      label: `${companyName || 'Corporate'} Office`,
      addressLine: baseLine,
      city,
      state,
      pincode,
    },
    {
      id: 'addr-factory',
      type: 'factory',
      label: 'Manufacturing Unit',
      addressLine: baseLine,
      city,
      state,
      pincode,
    },
  ];
};

export const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-primary',
    bankName: 'HDFC Bank',
    accountHolder: 'Industrial Polymers Pvt. Ltd.',
    accountNumberMasked: '•••• •••• 4821',
    ifsc: 'HDFC0001234',
    isPrimary: true,
  },
  {
    id: 'bank-secondary',
    bankName: 'ICICI Bank',
    accountHolder: 'Industrial Polymers Pvt. Ltd.',
    accountNumberMasked: '•••• •••• 9037',
    ifsc: 'ICIC0005678',
    isPrimary: false,
  },
];

export const DEFAULT_TAX_DOCUMENTS: TaxDocument[] = [
  {
    id: 'tax-gst',
    title: 'GST Certificate',
    subtitle: 'Goods & Services Tax registration',
    available: true,
  },
  {
    id: 'tax-pan',
    title: 'PAN Card',
    subtitle: 'Permanent Account Number',
    available: true,
  },
  {
    id: 'tax-po',
    title: 'Purchase Orders',
    subtitle: 'Recent procurement records',
    available: true,
  },
  {
    id: 'tax-invoices',
    title: 'Tax Invoices',
    subtitle: 'GST-compliant billing documents',
    available: true,
  },
];

export const LOGISTICS_MENU_ITEMS = [
  {
    id: 'saved-addresses',
    title: 'Saved Addresses',
    subtitleKey: 'addresses' as const,
    route: 'saved-addresses',
  },
  {
    id: 'bank-accounts',
    title: 'Bank Accounts',
    subtitleKey: 'banks' as const,
    route: 'bank-accounts',
  },
  {
    id: 'tax-documents',
    title: 'Tax Documents',
    subtitleKey: 'tax' as const,
    route: 'tax-documents',
  },
  {
    id: 'trading-credit',
    title: 'Trading Credit',
    subtitleKey: 'credit' as const,
    route: 'credit-facility',
  },
] as const;

export const SETTINGS_MENU_ITEMS = [
  { id: 'notifications', title: 'Notifications' },
  { id: 'help', title: 'Help & Support' },
  { id: 'terms', title: 'Terms & Privacy' },
  { id: 'logout', title: 'Logout Account', destructive: true },
] as const;

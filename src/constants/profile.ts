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
  {
    id: 'import-trading',
    title: 'Import Trading',
    subtitleKey: 'import' as const,
    route: 'import-trading',
  },
] as const;

export const SETTINGS_MENU_ITEMS = [
  { id: 'notifications', title: 'Notifications' },
  { id: 'help', title: 'Help & Support' },
  { id: 'terms', title: 'Terms & Privacy' },
  { id: 'logout', title: 'Logout Account', destructive: true },
] as const;

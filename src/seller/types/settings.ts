export type ThemeMode = 'light' | 'dark' | 'system';

export type LanguageOption = 'en' | 'hi';

export type CurrencyOption = 'INR' | 'USD';

export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export type SellerAppSettings = {
  notificationsEnabled: boolean;
  orderAlerts: boolean;
  paymentAlerts: boolean;
  dispatchAlerts: boolean;
  language: LanguageOption;
  theme: ThemeMode;
  currency: CurrencyOption;
  dateFormat: DateFormatOption;
  biometricLogin: boolean;
  appLock: boolean;
  sessionTimeoutMinutes: number;
  mockOffline: boolean;
};

export type SettingsGroupItem = {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'action' | 'info';
  value?: string | boolean | number;
  options?: { label: string; value: string }[];
};

export type SettingsGroup = {
  id: string;
  title: string;
  items: SettingsGroupItem[];
};

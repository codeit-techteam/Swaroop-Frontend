import type { SellerAppSettings } from '@/seller/types/settings';

export const DEFAULT_APP_SETTINGS: SellerAppSettings = {
  notificationsEnabled: true,
  orderAlerts: true,
  paymentAlerts: true,
  dispatchAlerts: true,
  language: 'en',
  theme: 'light',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  biometricLogin: false,
  appLock: false,
  sessionTimeoutMinutes: 30,
  mockOffline: false,
};

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
] as const;

export const THEME_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
] as const;

export const CURRENCY_OPTIONS = [
  { label: 'INR (₹)', value: 'INR' },
  { label: 'USD ($)', value: 'USD' },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
] as const;

export const SESSION_TIMEOUT_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: 'Never', value: 0 },
] as const;

export const APP_VERSION = 'PetroTrade Pro v2.4.1 (Build 241)';

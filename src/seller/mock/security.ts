import type { ActiveSession, SecuritySettings, TrustedDevice } from '@/seller/types/security';

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  biometricEnabled: false,
  twoFactorEnabled: false,
  pinSet: true,
};

export const MOCK_TRUSTED_DEVICES: TrustedDevice[] = [
  {
    id: 'dev-1',
    name: 'Samsung Galaxy S24',
    type: 'android',
    lastActive: '28 Jul 2026, 4:15 PM',
    isCurrent: true,
  },
  {
    id: 'dev-2',
    name: 'iPhone 15 Pro',
    type: 'iphone',
    lastActive: '27 Jul 2026, 9:30 AM',
    isCurrent: false,
  },
  {
    id: 'dev-3',
    name: 'Chrome on Windows',
    type: 'chrome',
    lastActive: '25 Jul 2026, 2:45 PM',
    isCurrent: false,
  },
  {
    id: 'dev-4',
    name: 'MacBook Pro',
    type: 'macbook',
    lastActive: '24 Jul 2026, 11:00 AM',
    isCurrent: false,
  },
];

export const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-1',
    device: 'Samsung Galaxy S24',
    location: 'Mumbai, Maharashtra',
    lastLogin: '28 Jul 2026, 4:15 PM',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    device: 'iPhone 15 Pro',
    location: 'Pune, Maharashtra',
    lastLogin: '27 Jul 2026, 9:30 AM',
    isCurrent: false,
  },
  {
    id: 'sess-3',
    device: 'Chrome on Windows',
    location: 'Ahmedabad, Gujarat',
    lastLogin: '25 Jul 2026, 2:45 PM',
    isCurrent: false,
  },
  {
    id: 'sess-4',
    device: 'MacBook Pro',
    location: 'Mumbai, Maharashtra',
    lastLogin: '24 Jul 2026, 11:00 AM',
    isCurrent: false,
  },
];

export const DEVICE_TYPE_LABELS: Record<string, string> = {
  android: 'Android',
  iphone: 'iPhone',
  chrome: 'Chrome',
  macbook: 'MacBook',
};

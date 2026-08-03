export type DeviceType = 'android' | 'iphone' | 'chrome' | 'macbook';

export type TrustedDevice = {
  id: string;
  name: string;
  type: DeviceType;
  lastActive: string;
  isCurrent: boolean;
};

export type ActiveSession = {
  id: string;
  device: string;
  location: string;
  lastLogin: string;
  isCurrent: boolean;
};

export type SecuritySettings = {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  pinSet: boolean;
};

export type SecuritySnapshot = {
  settings: SecuritySettings;
  trustedDevices: TrustedDevice[];
  activeSessions: ActiveSession[];
};

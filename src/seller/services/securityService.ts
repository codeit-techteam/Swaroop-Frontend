import { STORAGE_KEYS } from '@/constants';
import {
  DEFAULT_SECURITY_SETTINGS,
  MOCK_ACTIVE_SESSIONS,
  MOCK_TRUSTED_DEVICES,
} from '@/seller/mock/security';
import type { SecuritySettings, SecuritySnapshot } from '@/seller/types/security';
import { getStorageItem, setStorageItem } from '@/utils/storage';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SecurityState = {
  settings: SecuritySettings;
};

function loadSecurityState(): SecurityState {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_SECURITY_STATE);
  if (!raw) return { settings: { ...DEFAULT_SECURITY_SETTINGS } };
  try {
    return JSON.parse(raw) as SecurityState;
  } catch {
    return { settings: { ...DEFAULT_SECURITY_SETTINGS } };
  }
}

function persistSecurityState(state: SecurityState): void {
  setStorageItem(STORAGE_KEYS.SELLER_SECURITY_STATE, JSON.stringify(state));
}

let securityState = loadSecurityState();

export function getSecuritySnapshot(): SecuritySnapshot {
  return {
    settings: { ...securityState.settings },
    trustedDevices: MOCK_TRUSTED_DEVICES,
    activeSessions: MOCK_ACTIVE_SESSIONS,
  };
}

export function updateSecuritySettings(patch: Partial<SecuritySettings>): SecuritySettings {
  securityState = {
    settings: { ...securityState.settings, ...patch },
  };
  persistSecurityState(securityState);
  return { ...securityState.settings };
}

export async function logoutAllDevices(): Promise<void> {
  await delay(1200);
}

export async function removeTrustedDevice(deviceId: string): Promise<void> {
  await delay(600);
  void deviceId;
}

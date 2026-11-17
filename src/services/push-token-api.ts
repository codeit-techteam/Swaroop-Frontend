import { Platform } from 'react-native';

import * as Application from 'expo-application';

import { apiClient } from '@/api/client';
import { STORAGE_KEYS } from '@/constants';
import {
  isFcmRegistrationToken,
  isInstallationId,
  isLegacyExpoPushToken,
} from '@/services/fcm-token';
import { logger } from '@/utils/logger';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

let registrationsOpen = true;
let inflight: Promise<void> | null = null;

/** Logout closes registration so an in-flight refresh cannot undo the revoke. */
export const closePushRegistration = (): void => {
  registrationsOpen = false;
};

export const openPushRegistration = (): void => {
  registrationsOpen = true;
};

export const trackPushSync = (work: Promise<void>): void => {
  inflight = work.finally(() => {
    if (inflight === work) inflight = null;
  });
};

export const pushRegistrationOpen = (): boolean => registrationsOpen;

type RegisterInput = {
  token: string;
  platform: 'android';
  installationId: string;
  previousToken?: string;
};

const readRawToken = (): string | null =>
  getStorageItem(STORAGE_KEYS.FCM_DEVICE_TOKEN) ??
  getStorageItem(STORAGE_KEYS.EXPO_PUSH_TOKEN) ??
  null;

export const readStoredPushToken = (): string | null => {
  const value = readRawToken();
  return value && isFcmRegistrationToken(value) ? value : null;
};

/** Current FCM token, or a legacy Expo token that still needs a revoke. */
export const readRevocableStoredToken = (): string | null => {
  const value = readRawToken();
  if (!value) return null;
  if (isFcmRegistrationToken(value) || isLegacyExpoPushToken(value)) return value;
  return null;
};

export const rememberPushToken = (token: string): void => {
  setStorageItem(STORAGE_KEYS.FCM_DEVICE_TOKEN, token);
  removeStorageItem(STORAGE_KEYS.EXPO_PUSH_TOKEN);
};

const createInstallationId = (): string => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let index = 0; index < 24; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `inst${suffix}`;
};

export const readInstallationId = (): string => {
  const stored = getStorageItem(STORAGE_KEYS.INSTALLATION_ID);
  if (stored && isInstallationId(stored)) return stored;
  const androidId = Platform.OS === 'android' ? Application.getAndroidId() : null;
  const next = androidId && isInstallationId(androidId) ? androidId : createInstallationId();
  setStorageItem(STORAGE_KEYS.INSTALLATION_ID, next);
  return next;
};

/** Registers this install's native FCM token for the signed-in user. */
export async function registerPushToken(input: RegisterInput): Promise<void> {
  if (!registrationsOpen) return;
  if (!isFcmRegistrationToken(input.token)) return;
  await apiClient.post('/notifications/devices', {
    token: input.token,
    platform: input.platform,
    installationId: input.installationId,
    ...(input.previousToken ? { previousToken: input.previousToken } : {}),
  });
  if (!registrationsOpen) return;
  rememberPushToken(input.token);
}

/** Revokes the token for the current account. Call this before the session token is cleared. */
export async function unregisterCurrentPushToken(): Promise<void> {
  closePushRegistration();
  if (inflight) {
    await inflight.catch(() => undefined);
  }
  const token = readRevocableStoredToken();
  const accessToken = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!token || !accessToken) {
    if (token) {
      removeStorageItem(STORAGE_KEYS.FCM_DEVICE_TOKEN);
      removeStorageItem(STORAGE_KEYS.EXPO_PUSH_TOKEN);
    }
    return;
  }

  try {
    await apiClient.post('/notifications/devices/revoke', { token });
  } catch (error) {
    logger.warn('Push token revoke failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    removeStorageItem(STORAGE_KEYS.FCM_DEVICE_TOKEN);
    removeStorageItem(STORAGE_KEYS.EXPO_PUSH_TOKEN);
  }
}

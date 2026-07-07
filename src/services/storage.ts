import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants';
import { EMPTY_BUSINESS_INFO, INITIAL_DOCUMENTS } from '@/constants/documents';
import type { DocumentItem } from '@/types/document';
import type { BusinessInformation } from '@/types/kyc';
import type {
  AppSettingsPayload,
  AuthPayload,
  KycPayload,
  SessionSnapshot,
  UserProfilePayload,
} from '@/types/session';
import { clearStorage, getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

const DEFAULT_AUTH: AuthPayload = {
  isLoggedIn: false,
  mobileNumber: null,
};

const DEFAULT_KYC: KycPayload = {
  kycApproved: false,
  reviewSubmitted: false,
  referenceId: null,
  submittedAt: null,
};

const DEFAULT_APP_SETTINGS: AppSettingsPayload = {
  onboardingCompleted: false,
  location: null,
};

const saveJson = <T>(key: string, value: T): void => {
  setStorageItem(key, JSON.stringify(value));
};

const getJson = <T>(key: string): T | null => {
  const raw = getStorageItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const saveAuth = (auth: AuthPayload): void => {
  saveJson(STORAGE_KEYS.AUTH_STORAGE_KEY, auth);
};

export const getAuth = (): AuthPayload =>
  getJson<AuthPayload>(STORAGE_KEYS.AUTH_STORAGE_KEY) ?? DEFAULT_AUTH;

export const saveUser = (user: UserProfilePayload): void => {
  saveJson(STORAGE_KEYS.USER_PROFILE_KEY, user);
};

export const getUser = (): UserProfilePayload | null =>
  getJson<UserProfilePayload>(STORAGE_KEYS.USER_PROFILE_KEY);

export const clearUser = (): void => {
  removeStorageItem(STORAGE_KEYS.USER_PROFILE_KEY);
};

export const saveBusinessInfo = (info: BusinessInformation): void => {
  saveJson(STORAGE_KEYS.BUSINESS_INFO_KEY, info);
};

export const getBusinessInfo = (): BusinessInformation | null =>
  getJson<BusinessInformation>(STORAGE_KEYS.BUSINESS_INFO_KEY);

export const saveDocuments = (documents: DocumentItem[]): void => {
  saveJson(STORAGE_KEYS.DOCUMENTS_KEY, documents);
};

export const getDocuments = (): DocumentItem[] | null =>
  getJson<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS_KEY);

export const saveKYC = (kyc: KycPayload): void => {
  saveJson(STORAGE_KEYS.KYC_STATUS_KEY, kyc);
};

export const getKYC = (): KycPayload =>
  getJson<KycPayload>(STORAGE_KEYS.KYC_STATUS_KEY) ?? DEFAULT_KYC;

export const saveAppSettings = (settings: AppSettingsPayload): void => {
  saveJson(STORAGE_KEYS.APP_SETTINGS_KEY, settings);
};

export const getAppSettings = (): AppSettingsPayload =>
  getJson<AppSettingsPayload>(STORAGE_KEYS.APP_SETTINGS_KEY) ?? DEFAULT_APP_SETTINGS;

export const getSessionSnapshot = (): SessionSnapshot => ({
  auth: getAuth(),
  userProfile: getUser(),
  businessInformation: getBusinessInfo(),
  documents: getDocuments(),
  kyc: getKYC(),
  appSettings: getAppSettings(),
});

export const clearAll = async (): Promise<void> => {
  clearStorage();
  await AsyncStorage.clear();
};

export const getDefaultBusinessInfo = (): BusinessInformation => ({ ...EMPTY_BUSINESS_INFO });

export const getDefaultDocuments = (): DocumentItem[] =>
  INITIAL_DOCUMENTS.map((document) => ({ ...document }));

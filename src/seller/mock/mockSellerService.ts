import { STORAGE_KEYS } from '@/constants';
import {
  EMPTY_SELLER_COMPANY,
  SELLER_DEMO_MOBILE,
  SELLER_DEMO_OTP,
  SELLER_INITIAL_DOCUMENTS,
} from '@/seller/constants';
import type { SellerDocumentId, SellerSnapshot } from '@/seller/types';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

const safeParse = <T>(value: string | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getBoolean = (key: string, fallback = false): boolean => {
  const value = getStorageItem(key);
  if (value == null) {
    return fallback;
  }
  return value === 'true';
};

const setBoolean = (key: string, value: boolean): void => {
  setStorageItem(key, value ? 'true' : 'false');
};

export const buildDefaultSellerSnapshot = (): SellerSnapshot => ({
  sellerRole: 'seller',
  sellerLoggedIn: false,
  sellerProfileCompleted: false,
  verificationSubmitted: false,
  dashboardAccess: false,
  otpVerified: false,
  mobile: '',
  company: { ...EMPTY_SELLER_COMPANY },
  documents: SELLER_INITIAL_DOCUMENTS.map((document) => ({ ...document })),
  profile: {
    ownerName: 'Seller Admin',
    companyInitials: 'PT',
  },
});

export const getSellerSnapshot = (): SellerSnapshot => {
  const fallback = buildDefaultSellerSnapshot();

  return {
    ...fallback,
    sellerRole: 'seller',
    sellerLoggedIn: getBoolean(STORAGE_KEYS.SELLER_LOGGED_IN, false),
    sellerProfileCompleted: getBoolean(STORAGE_KEYS.SELLER_PROFILE_COMPLETED, false),
    verificationSubmitted: getBoolean(STORAGE_KEYS.SELLER_VERIFICATION_SUBMITTED, false),
    dashboardAccess: getBoolean(STORAGE_KEYS.SELLER_DASHBOARD_ACCESS, false),
    otpVerified: getBoolean(STORAGE_KEYS.SELLER_OTP_VERIFIED, false),
    mobile: getStorageItem(STORAGE_KEYS.SELLER_MOBILE) ?? '',
    company: safeParse(
      STORAGE_KEYS.SELLER_COMPANY ? getStorageItem(STORAGE_KEYS.SELLER_COMPANY) : undefined,
      fallback.company,
    ),
    documents: safeParse(
      STORAGE_KEYS.SELLER_DOCUMENTS ? getStorageItem(STORAGE_KEYS.SELLER_DOCUMENTS) : undefined,
      fallback.documents,
    ),
    profile: safeParse(
      STORAGE_KEYS.SELLER_PROFILE ? getStorageItem(STORAGE_KEYS.SELLER_PROFILE) : undefined,
      fallback.profile,
    ),
  };
};

export const persistSellerSnapshot = (snapshot: SellerSnapshot): void => {
  setBoolean(STORAGE_KEYS.SELLER_LOGGED_IN, snapshot.sellerLoggedIn);
  setBoolean(STORAGE_KEYS.SELLER_PROFILE_COMPLETED, snapshot.sellerProfileCompleted);
  setBoolean(STORAGE_KEYS.SELLER_VERIFICATION_SUBMITTED, snapshot.verificationSubmitted);
  setBoolean(STORAGE_KEYS.SELLER_DASHBOARD_ACCESS, snapshot.dashboardAccess);
  setBoolean(STORAGE_KEYS.SELLER_OTP_VERIFIED, snapshot.otpVerified);
  setStorageItem(STORAGE_KEYS.SELLER_ROLE, snapshot.sellerRole);
  setStorageItem(STORAGE_KEYS.SELLER_MOBILE, snapshot.mobile);
  setStorageItem(STORAGE_KEYS.SELLER_COMPANY, JSON.stringify(snapshot.company));
  setStorageItem(STORAGE_KEYS.SELLER_DOCUMENTS, JSON.stringify(snapshot.documents));
  setStorageItem(STORAGE_KEYS.SELLER_PROFILE, JSON.stringify(snapshot.profile));
};

export const requestSellerOtp = (mobile: string): { requiresOtp: boolean } => {
  const snapshot = getSellerSnapshot();
  const isRepeatDemoLogin =
    mobile === SELLER_DEMO_MOBILE && snapshot.sellerLoggedIn && snapshot.dashboardAccess;

  return {
    requiresOtp: !isRepeatDemoLogin,
  };
};

export const verifySellerOtp = (mobile: string, otp: string): boolean =>
  mobile === SELLER_DEMO_MOBILE && otp === SELLER_DEMO_OTP;

export const isSellerOnboardingComplete = (snapshot: SellerSnapshot): boolean =>
  snapshot.sellerProfileCompleted && snapshot.dashboardAccess;

export const isSellerCompanyFilled = (snapshot: SellerSnapshot): boolean =>
  Boolean(snapshot.company.companyName && snapshot.company.gst && snapshot.company.pan);

export const areSellerDocumentsReady = (snapshot: SellerSnapshot): boolean =>
  snapshot.documents.every((document) => document.status === 'uploaded');

export const resetSellerSession = (): void => {
  removeStorageItem(STORAGE_KEYS.SELLER_ROLE);
  removeStorageItem(STORAGE_KEYS.SELLER_MOBILE);
  removeStorageItem(STORAGE_KEYS.SELLER_COMPANY);
  removeStorageItem(STORAGE_KEYS.SELLER_DOCUMENTS);
  removeStorageItem(STORAGE_KEYS.SELLER_PROFILE);
  removeStorageItem(STORAGE_KEYS.SELLER_LOGGED_IN);
  removeStorageItem(STORAGE_KEYS.SELLER_PROFILE_COMPLETED);
  removeStorageItem(STORAGE_KEYS.SELLER_VERIFICATION_SUBMITTED);
  removeStorageItem(STORAGE_KEYS.SELLER_DASHBOARD_ACCESS);
  removeStorageItem(STORAGE_KEYS.SELLER_OTP_VERIFIED);
};

export const cloneDocumentsWithPatch = (
  snapshot: SellerSnapshot,
  documentId: SellerDocumentId,
  patch: Partial<SellerSnapshot['documents'][number]>,
): SellerSnapshot['documents'] =>
  snapshot.documents.map((document) =>
    document.id === documentId ? { ...document, ...patch } : document,
  );

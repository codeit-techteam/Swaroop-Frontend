import { DEMO_PHONE, DEVELOPMENT_MODE } from '@/config/development';
import { STORAGE_KEYS } from '@/constants';
import { EMPTY_BUSINESS_INFO, INITIAL_DOCUMENTS } from '@/constants/documents';
import {
  getAppSettings,
  getAuth,
  getBusinessInfo,
  getDocuments,
  getKYC,
  getUser,
  saveAppSettings,
  saveAuth,
  saveBusinessInfo,
  saveDocuments,
  saveKYC,
  saveUser,
} from '@/services/storage';
import type { DocumentItem } from '@/types/document';
import type { BusinessInformation } from '@/types/kyc';
import type { CurrentUser, UserRole } from '@/types/session';
import { removeStorageItem } from '@/utils/storage';

const SESSION_KEYS = [
  STORAGE_KEYS.ACCESS_TOKEN,
  STORAGE_KEYS.REFRESH_TOKEN,
  STORAGE_KEYS.SESSION_SOURCE,
] as const;

const USER_SCOPED_KEYS = [
  STORAGE_KEYS.USER_PROFILE_KEY,
  STORAGE_KEYS.CART_KEY,
  STORAGE_KEYS.PAYMENT_KEY,
  STORAGE_KEYS.CHECKOUT_KEY,
  STORAGE_KEYS.ORDER_KEY,
  STORAGE_KEYS.CUSTOMER_ADDRESSES,
  STORAGE_KEYS.CUSTOMER_RECENT_SEARCHES,
] as const;

/** Values the removed development seed wrote to device storage. */
const LEGACY_DEMO_REFERENCE_ID = 'PT-KYC-DEMO';
const LEGACY_DEMO_GSTIN = '22AAAAA0000A1Z5';

export const isDemoUser = (mobileNumber?: string | null): boolean => {
  if (!DEVELOPMENT_MODE) {
    return false;
  }

  const phone = mobileNumber ?? getAuth().mobileNumber;
  return phone === DEMO_PHONE;
};

export const getCurrentUser = (): CurrentUser => {
  const auth = getAuth();
  const user = getUser();
  const businessInfo = getBusinessInfo();
  const documents = getDocuments() ?? [];
  const kyc = getKYC();

  const documentStatus = (id: DocumentItem['id']): boolean =>
    documents.some(
      (document) =>
        document.id === id && (document.status === 'uploaded' || document.status === 'verified'),
    );

  return {
    isLoggedIn: auth.isLoggedIn,
    mobileNumber: auth.mobileNumber,
    role: 'customer',
    userType: 'customer',
    selectedRole: user?.selectedRole ?? null,
    displayName: user?.displayName,
    businessInfoCompleted: Boolean(businessInfo?.businessEntityName && businessInfo?.gstNumber),
    companyName: businessInfo?.businessEntityName ?? '',
    companyType: businessInfo?.companyType ?? '',
    gst: businessInfo?.gstNumber ?? '',
    pan: businessInfo?.panNumber ?? '',
    address: businessInfo?.businessAddress ?? '',
    panUploaded: documentStatus('pan'),
    gstUploaded: documentStatus('gst'),
    aadhaarUploaded: documentStatus('aadhaar'),
    cancelledChequeUploaded: documentStatus('cancelled_cheque'),
    isKycApproved: kyc.kycApproved,
    reviewCompleted: kyc.reviewSubmitted,
    applicationSubmitted: kyc.reviewSubmitted,
    referenceId: kyc.referenceId,
  };
};

export const saveCurrentUser = (user: Partial<CurrentUser>): CurrentUser => {
  const current = getCurrentUser();
  const next: CurrentUser = { ...current, ...user };

  saveAuth({
    isLoggedIn: next.isLoggedIn,
    mobileNumber: next.mobileNumber,
  });

  if (next.mobileNumber) {
    saveUser({
      mobileNumber: next.mobileNumber,
      selectedRole: (next.selectedRole ?? 'buyer') as UserRole,
      displayName: next.displayName ?? next.companyName ?? undefined,
    });
  }

  if (next.businessInfoCompleted || next.companyName) {
    const existingBusiness = getBusinessInfo();
    saveBusinessInfo({
      businessEntityName: next.companyName || existingBusiness?.businessEntityName || '',
      companyType:
        (next.companyType as BusinessInformation['companyType']) ||
        existingBusiness?.companyType ||
        '',
      gstNumber: next.gst || existingBusiness?.gstNumber || '',
      panNumber: next.pan || existingBusiness?.panNumber || '',
      businessEmail: existingBusiness?.businessEmail || '',
      mobileNumber: next.mobileNumber || existingBusiness?.mobileNumber || '',
      businessAddress: next.address || existingBusiness?.businessAddress || '',
      state: existingBusiness?.state || '',
      city: existingBusiness?.city || '',
      pincode: existingBusiness?.pincode || '',
      natureOfBusiness: existingBusiness?.natureOfBusiness || '',
      annualPurchaseVolume: existingBusiness?.annualPurchaseVolume || '',
      expectedMonthlyRequirement: existingBusiness?.expectedMonthlyRequirement || '',
    });
  }

  saveKYC({
    kycApproved: next.isKycApproved,
    reviewSubmitted: next.reviewCompleted || next.applicationSubmitted,
    referenceId: next.referenceId,
    submittedAt: getKYC().submittedAt,
  });

  return getCurrentUser();
};

/**
 * Wipes KYC / business / document data so a fresh (non-demo) user starts the
 * Business Info → Documents → Review flow from scratch.
 */
export const resetKycData = (): void => {
  saveBusinessInfo({ ...EMPTY_BUSINESS_INFO });
  saveDocuments(INITIAL_DOCUMENTS.map((document) => ({ ...document })));
  saveKYC({
    kycApproved: false,
    reviewSubmitted: false,
    referenceId: null,
    submittedAt: null,
  });
};

/**
 * True when device storage still holds the fake company the old development seed
 * wrote (Karan Veer Trading / 22AAAAA0000A1Z5). It must never be shown as real data.
 */
export const hasLegacyDemoData = (): boolean =>
  getKYC().referenceId === LEGACY_DEMO_REFERENCE_ID ||
  getBusinessInfo()?.gstNumber === LEGACY_DEMO_GSTIN ||
  (getDocuments() ?? []).some((document) => document.file?.uri.startsWith('demo://'));

/**
 * Removes everything tied to the signed-in person: session tokens, KYC draft and
 * cached decision, profile, cart, checkout, orders, payment and addresses. Device
 * preferences (onboarding, theme) stay. The next account starts from the backend.
 */
export const clearUserData = (options?: { keepSession?: boolean }): void => {
  if (!options?.keepSession) SESSION_KEYS.forEach((key) => removeStorageItem(key));
  USER_SCOPED_KEYS.forEach((key) => removeStorageItem(key));
  saveAppSettings({ ...getAppSettings(), location: null });
  resetKycData();
};

/** Signs out and clears user data so the next account cannot see this one's. */
export const logout = (): void => {
  clearUserData();
  saveAuth({ isLoggedIn: false, mobileNumber: null });
};

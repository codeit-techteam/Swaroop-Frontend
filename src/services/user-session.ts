import { INITIAL_DOCUMENTS } from '@/constants/documents';
import { DEMO_PHONE, DEVELOPMENT_MODE } from '@/config/development';
import {
  getAuth,
  getBusinessInfo,
  getDocuments,
  getKYC,
  getUser,
  saveAuth,
  saveBusinessInfo,
  saveDocuments,
  saveKYC,
  saveUser,
} from '@/services/storage';
import type { DocumentItem } from '@/types/document';
import type { BusinessInformation } from '@/types/kyc';
import type { CurrentUser, UserRole } from '@/types/session';

const DEMO_REFERENCE_ID = 'PT-KYC-DEMO';

const DEMO_BUSINESS_INFO: BusinessInformation = {
  businessEntityName: 'Global PetroChem Ltd.',
  companyType: 'Private Limited',
  gstNumber: '22AAAAA0000A1Z5',
  panNumber: 'ABCDE1234F',
  businessEmail: 'ops@globalpetrochem.demo',
  mobileNumber: DEMO_PHONE,
  businessAddress: 'Mumbai, Maharashtra',
  state: 'Maharashtra',
  city: 'Mumbai',
  pincode: '400001',
  natureOfBusiness: 'Petrochemical Trading',
  annualPurchaseVolume: '1000+ MT',
  expectedMonthlyRequirement: '100 MT',
};

const buildDemoDocuments = (): DocumentItem[] =>
  INITIAL_DOCUMENTS.map((document) => {
    if (document.id === 'cancelled_cheque') {
      return { ...document, status: 'idle', progress: 0, file: undefined };
    }

    return {
      ...document,
      status: 'uploaded',
      progress: 100,
      file: {
        name: `${document.id}-demo.pdf`,
        uri: `demo://${document.id}`,
        size: 1024,
        mimeType: 'application/pdf',
      },
    };
  });

const hasDemoProfile = (): boolean => {
  const auth = getAuth();
  const kyc = getKYC();
  const businessInfo = getBusinessInfo();
  const user = getUser();

  return (
    auth.mobileNumber === DEMO_PHONE &&
    kyc.kycApproved === true &&
    Boolean(businessInfo?.businessEntityName) &&
    Boolean(user?.mobileNumber)
  );
};

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
  });

  return getCurrentUser();
};

/**
 * Seeds the permanent demo account on first login.
 * Reuses existing profile data when present — never overwrites it.
 */
export const seedDemoUser = (): CurrentUser => {
  if (!DEVELOPMENT_MODE) {
    return getCurrentUser();
  }

  if (hasDemoProfile()) {
    saveAuth({ isLoggedIn: true, mobileNumber: DEMO_PHONE });
    return getCurrentUser();
  }

  saveAuth({
    isLoggedIn: true,
    mobileNumber: DEMO_PHONE,
  });

  saveUser({
    mobileNumber: DEMO_PHONE,
    selectedRole: 'buyer',
    displayName: DEMO_BUSINESS_INFO.businessEntityName,
  });

  saveBusinessInfo({ ...DEMO_BUSINESS_INFO });
  saveDocuments(buildDemoDocuments());

  saveKYC({
    kycApproved: true,
    reviewSubmitted: true,
    referenceId: DEMO_REFERENCE_ID,
  });

  return getCurrentUser();
};

/** Clears login flag only — profile / KYC data is preserved. */
export const logout = (): void => {
  const auth = getAuth();
  saveAuth({
    isLoggedIn: false,
    mobileNumber: auth.mobileNumber,
  });
};

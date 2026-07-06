import type { DocumentItem } from '@/types/document';
import type { DeliveryLocation } from '@/types/home';
import type { BusinessInformation } from '@/types/kyc';

export type UserRole = 'buyer' | 'seller';

export type AuthPayload = {
  isLoggedIn: boolean;
  mobileNumber: string | null;
};

export type UserProfilePayload = {
  mobileNumber: string;
  selectedRole: UserRole | null;
  displayName?: string;
  profilePhotoUri?: string | null;
  companyLogoUri?: string | null;
  establishedYear?: string;
};

export type KycPayload = {
  kycApproved: boolean;
  reviewSubmitted: boolean;
  referenceId: string | null;
};

export type AppSettingsPayload = {
  onboardingCompleted: boolean;
  location: DeliveryLocation | null;
};

/** Aggregated local session used by auth helpers (AsyncStorage-backed). */
export type CurrentUser = {
  isLoggedIn: boolean;
  mobileNumber: string | null;
  role: 'customer';
  userType: 'customer';
  selectedRole: UserRole | null;
  displayName?: string;
  businessInfoCompleted: boolean;
  companyName: string;
  companyType: string;
  gst: string;
  pan: string;
  address: string;
  panUploaded: boolean;
  gstUploaded: boolean;
  aadhaarUploaded: boolean;
  cancelledChequeUploaded: boolean;
  isKycApproved: boolean;
  reviewCompleted: boolean;
  applicationSubmitted: boolean;
  referenceId: string | null;
};

export type LoginResult = {
  kycApproved: boolean;
  isDemoUser: boolean;
};

export type SessionSnapshot = {
  auth: AuthPayload;
  userProfile: UserProfilePayload | null;
  businessInformation: BusinessInformation | null;
  documents: DocumentItem[] | null;
  kyc: KycPayload;
  appSettings: AppSettingsPayload;
};

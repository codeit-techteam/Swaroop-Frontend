import type { CompanyType } from '@/types/kyc';

export type KycVerificationStatus = 'verified' | 'pending' | 'unverified';

export type MembershipTier = 'Prime Member' | 'Standard Member';

export type TradingStatus = 'Active' | 'Inactive';

export type AddressType = 'warehouse' | 'office' | 'factory';

export type SavedAddress = {
  id: string;
  type: AddressType;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isPrimary?: boolean;
};

export type BankAccount = {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumberMasked: string;
  ifsc: string;
  isPrimary: boolean;
};

export type TaxDocument = {
  id: string;
  title: string;
  subtitle: string;
  available: boolean;
};

export type ComplianceStatus = {
  kycVerified: boolean;
  gstVerified: boolean;
  panVerified: boolean;
  documentsComplete: boolean;
  validTillLabel: string;
  summary: string;
};

export type ProfileData = {
  displayName: string;
  companyName: string;
  companyType: CompanyType | '';
  profilePhotoUri: string | null;
  companyLogoUri: string | null;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  businessAddress: string;
  state: string;
  city: string;
  pincode: string;
  natureOfBusiness: string;
  establishedYear: string;
  kycStatus: KycVerificationStatus;
  membership: MembershipTier;
  tradingStatus: TradingStatus;
  compliance: ComplianceStatus;
  savedAddresses: SavedAddress[];
  bankAccounts: BankAccount[];
  taxDocuments: TaxDocument[];
};

export type ProfileUpdatePayload = {
  displayName?: string;
  email?: string;
  phone?: string;
  profilePhotoUri?: string | null;
  companyLogoUri?: string | null;
  businessAddress?: string;
  natureOfBusiness?: string;
};

export type LogisticsMenuItem = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
};

export type SettingsMenuItem = {
  id: string;
  title: string;
  destructive?: boolean;
};

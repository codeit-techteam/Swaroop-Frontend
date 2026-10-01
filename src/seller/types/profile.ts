export type SellerProfileDocument = {
  id: string;
  title: string;
  subtitle?: string;
};

export type SellerProfileMenuRoute =
  | 'company-profile'
  | 'business-address'
  | 'gst-information'
  | 'my-offers'
  | 'my-shipments'
  | 'bank-details'
  | 'kyc-documents'
  | 'trade-licenses'
  | 'help-support'
  | 'documents-center'
  | 'app-settings'
  | 'security';

export type SellerProfileData = {
  name: string;
  company: string;
  initials: string;
  verified: boolean;
  badge: string;
  gst: string;
  profileImage: string | null;
  address: string;
  bankVerified: boolean;
  kycStatus: string;
  kycDocumentsCount: number;
  appVersion: string;
};

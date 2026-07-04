import type { DocumentItem } from '@/types/document';

export type CompanyType =
  | 'Proprietorship'
  | 'Partnership'
  | 'LLP'
  | 'Private Limited'
  | 'Public Limited'
  | 'OPC';

export type BusinessInformation = {
  businessEntityName: string;
  companyType: CompanyType | '';
  gstNumber: string;
  panNumber: string;
  businessEmail: string;
  mobileNumber: string;
  businessAddress: string;
  state: string;
  city: string;
  pincode: string;
  natureOfBusiness: string;
  annualPurchaseVolume: string;
  expectedMonthlyRequirement: string;
};

export type KycState = {
  businessInfo: BusinessInformation;
  documents: DocumentItem[];
  referenceId: string | null;
};

export type KycActions = {
  setBusinessInfo: (info: BusinessInformation) => void;
  updateBusinessInfo: (patch: Partial<BusinessInformation>) => void;
  setDocuments: (documents: DocumentItem[]) => void;
  updateDocument: (id: DocumentItem['id'], patch: Partial<DocumentItem>) => void;
  setReferenceId: (referenceId: string) => void;
  resetKyc: () => void;
};

export type KycStore = KycState & KycActions;

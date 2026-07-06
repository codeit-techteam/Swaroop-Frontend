export type TransferBankDetails = {
  transferTo: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
  upiId: string;
};

export const PETROTRADE_TRANSFER_BANK: TransferBankDetails = {
  transferTo: 'PetroTrade Technologies Pvt Ltd',
  bankName: 'HDFC Bank',
  ifscCode: 'HDFC0002231',
  accountNumber: 'XXXXXXXXX3421',
  upiId: 'payments@petrotrade',
};

export const INDIAN_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'State Bank of India',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'IDFC First Bank',
  'Yes Bank',
  'Union Bank of India',
  'Indian Bank',
  'Federal Bank',
  'Bandhan Bank',
  'AU Small Finance Bank',
  'IndusInd Bank',
] as const;

export type IndianBank = (typeof INDIAN_BANKS)[number];

export const PAYMENT_MODES = ['RTGS', 'NEFT', 'IMPS', 'UPI'] as const;

export const DEFAULT_PAYMENT_MODE = 'RTGS' as const;

export const MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_RECEIPT_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;

export const ALLOWED_RECEIPT_DOCUMENT_TYPES = [
  ...ALLOWED_RECEIPT_IMAGE_TYPES,
  'application/pdf',
] as const;

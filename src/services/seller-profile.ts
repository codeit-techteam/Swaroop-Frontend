import { apiClient } from '@/api/client';
import { STORAGE_KEYS } from '@/constants';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

type Envelope<T> = {
  success?: boolean;
  data: T;
};

/** Mirrors `SellerProfileSummary` from GET /seller/profile (shared with Seller Web). */
export type SellerAccountSummary = {
  sellerProfileId: string;
  status: string;
  verificationStatus: string;
  verified: boolean;
  ownerName: string;
  companyName: string;
  legalName: string;
  initials: string;
  businessType: string | null;
  sellerType: string | null;
  industry: string | null;
  contactName: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  gstState: string | null;
  pan: string | null;
  logoUrl: string | null;
  yearsInBusiness: string | null;
  paymentTerms: string | null;
  registeredAddress: string | null;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    type: string;
  } | null;
  bank: {
    accountHolder: string;
    bankName: string;
    accountNumberMasked: string;
    ifsc: string;
    branch: string | null;
    verificationStatus: string;
  } | null;
  gstVerified: boolean;
  panVerified: boolean;
  bankVerified: boolean;
  kycDocumentsCount: number;
  approvedAt: string | null;
};

export type SellerAccountManager = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  status?: string;
  isPrimary?: boolean;
};

export type SellerAccountProfile = {
  summary: SellerAccountSummary;
  accountManagers: SellerAccountManager[];
};

export async function fetchSellerAccountProfile(): Promise<SellerAccountProfile> {
  const { ensureDevBackendSession } = await import('@/services/backend-session');
  await ensureDevBackendSession('seller');
  const response = await apiClient.get<
    Envelope<{ summary?: SellerAccountSummary; accountManagers?: SellerAccountManager[] }>
  >('/seller/profile');
  const payload = response.data?.data;
  if (!payload?.summary) {
    throw new Error('Seller profile response is missing the account summary.');
  }
  return {
    summary: payload.summary,
    accountManagers: Array.isArray(payload.accountManagers) ? payload.accountManagers : [],
  };
}

export function readCachedSellerAccount(): SellerAccountSummary | null {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_ACCOUNT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SellerAccountSummary;
  } catch {
    return null;
  }
}

export function cacheSellerAccount(summary: SellerAccountSummary): void {
  setStorageItem(STORAGE_KEYS.SELLER_ACCOUNT, JSON.stringify(summary));
}

export function clearCachedSellerAccount(): void {
  removeStorageItem(STORAGE_KEYS.SELLER_ACCOUNT);
}

export function formatSellerAddress(summary: SellerAccountSummary | null): string | null {
  const address = summary?.address;
  if (!address) return summary?.registeredAddress ?? null;
  const region = [address.state, address.postalCode].filter(Boolean).join(' ');
  return [address.city, region].filter(Boolean).join(', ') || address.line1;
}

const SELLER_TYPE_LABELS: Record<string, string> = {
  distributor: 'Distributor',
  manufacturer: 'Manufacturer',
  trader: 'Trader',
  importer: 'Importer',
};

export function formatSellerTypeLabel(summary: SellerAccountSummary | null): string {
  const type = summary?.sellerType?.toLowerCase();
  if (type && SELLER_TYPE_LABELS[type]) return SELLER_TYPE_LABELS[type];
  if (summary?.sellerType) return summary.sellerType;
  return 'Seller';
}

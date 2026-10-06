import { fetchCustomerKyc, type CustomerKycOverview } from '@/services/customer-kyc';
import { fetchSellerOnboardingStatus } from '@/services/seller-onboarding';
import { useAuthStore } from '@/store/auth-store';
import { useCustomerKycOverviewStore } from '@/store/customer-kyc-overview-store';
import { logger } from '@/utils/logger';

/**
 * True when the same account is a seller whose business was already approved by
 * an admin. Accounts without the SELLER role get 403/404 and resolve to false.
 */
async function isAdminApprovedSeller(): Promise<boolean> {
  try {
    const status = await fetchSellerOnboardingStatus();
    return status?.sellerStatus === 'APPROVED' || status?.status === 'APPROVED';
  } catch {
    return false;
  }
}

/**
 * Pulls the customer's KYC decision and company profile from the backend (shared
 * with the web app) and applies it to the auth store and the in-memory overview
 * store. A business already approved as a seller is treated as verified, so
 * registered users land on Home instead of onboarding. Returns null when the
 * backend is unreachable, in which case the last synced value stays in place.
 */
export async function refreshKycStatus(): Promise<CustomerKycOverview | null> {
  const overviewStore = useCustomerKycOverviewStore.getState();
  const { generation } = overviewStore;
  const isCurrent = () => useCustomerKycOverviewStore.getState().generation === generation;
  if (!overviewStore.overview) overviewStore.setLoading();
  try {
    const overview = await fetchCustomerKyc();
    const approvedSeller = !overview.kycVerified && (await isAdminApprovedSeller());
    if (!isCurrent()) return null;
    useAuthStore
      .getState()
      .syncKycStatus(approvedSeller ? { ...overview, kycVerified: true } : overview);
    useCustomerKycOverviewStore.getState().setOverview(overview);
    return overview;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('Customer KYC status refresh failed', { message });
    if (isCurrent()) useCustomerKycOverviewStore.getState().setError(message);
    return null;
  }
}

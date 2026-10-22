import { fetchCustomerKyc, type CustomerKycOverview } from '@/services/customer-kyc';
import { useAuthStore } from '@/store/auth-store';
import { useCustomerKycOverviewStore } from '@/store/customer-kyc-overview-store';
import { logger } from '@/utils/logger';

/**
 * Pulls the customer's KYC decision from the backend (shared with Customer Web)
 * and applies it to the auth store and in-memory overview store.
 *
 * Seller approval must NOT force customer `kycVerified` — PAN/GST/seller status
 * are separate from overall customer KYC approval.
 *
 * Returns null when the backend is unreachable (last synced value stays until
 * a successful refresh clears or updates it).
 */
export async function refreshKycStatus(): Promise<CustomerKycOverview | null> {
  const overviewStore = useCustomerKycOverviewStore.getState();
  const { generation } = overviewStore;
  const isCurrent = () => useCustomerKycOverviewStore.getState().generation === generation;
  if (!overviewStore.overview) overviewStore.setLoading();
  try {
    const overview = await fetchCustomerKyc();
    if (!isCurrent()) return null;
    useAuthStore.getState().syncKycStatus(overview);
    useCustomerKycOverviewStore.getState().setOverview(overview);
    return overview;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('Customer KYC status refresh failed', { message });
    if (isCurrent()) useCustomerKycOverviewStore.getState().setError(message);
    return null;
  }
}

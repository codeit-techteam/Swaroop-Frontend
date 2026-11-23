import { fetchCustomerKyc, type CustomerKycOverview } from '@/services/customer-kyc';
import { useAuthStore } from '@/store/auth-store';
import { useCustomerKycOverviewStore } from '@/store/customer-kyc-overview-store';
import { logger } from '@/utils/logger';

export type RefreshKycStatusOptions = {
  /** Extra attempts after the first failure (default 0). */
  retries?: number;
  /** Delay between retries in ms (default 400). */
  retryDelayMs?: number;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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
export async function refreshKycStatus(
  options: RefreshKycStatusOptions = {},
): Promise<CustomerKycOverview | null> {
  const retries = Math.max(0, options.retries ?? 0);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 400);
  const overviewStore = useCustomerKycOverviewStore.getState();
  const { generation } = overviewStore;
  const isCurrent = () => useCustomerKycOverviewStore.getState().generation === generation;
  if (!overviewStore.overview) overviewStore.setLoading();

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const overview = await fetchCustomerKyc();
      if (!isCurrent()) return null;
      useAuthStore.getState().syncKycStatus(overview);
      useCustomerKycOverviewStore.getState().setOverview(overview);
      return overview;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  logger.warn('Customer KYC status refresh failed', { message });
  if (isCurrent()) useCustomerKycOverviewStore.getState().setError(message);
  return null;
}

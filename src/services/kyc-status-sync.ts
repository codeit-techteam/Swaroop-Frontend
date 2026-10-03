import { fetchCustomerKyc, type CustomerKycOverview } from '@/services/customer-kyc';
import { useAuthStore } from '@/store/auth-store';
import { logger } from '@/utils/logger';

/**
 * Pulls the customer's KYC decision from the backend (shared with the web app)
 * and applies it to the auth store. Returns null when the backend is unreachable,
 * in which case the last synced value stays in place.
 */
export async function refreshKycStatus(): Promise<CustomerKycOverview | null> {
  try {
    const overview = await fetchCustomerKyc();
    useAuthStore.getState().syncKycStatus(overview);
    return overview;
  } catch (error) {
    logger.warn('Customer KYC status refresh failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

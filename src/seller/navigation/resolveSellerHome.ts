import { DEMO_OTP, DEMO_PHONE } from '@/config/development';
import { useSellerStore } from '@/seller/store/sellerStore';
import {
  fetchSellerOnboardingStatus,
  isExistingSellerAccount,
} from '@/services/seller-onboarding';

export type SellerHomeAccess = 'home' | 'onboarding' | 'unknown';

/** Seeded seller phone 8240890242. OTP is checked when the caller just verified it. */
export function isKnownExistingDemoSeller(mobile: string, otp?: string): boolean {
  const digits = mobile.replace(/\D/g, '').slice(-10);
  if (digits !== DEMO_PHONE) return false;
  return otp == null || otp === DEMO_OTP;
}

/**
 * Asks the API whether this seller already finished onboarding.
 * `home` means local session flags were updated for the dashboard.
 */
export async function resolveSellerHomeAccess(): Promise<SellerHomeAccess> {
  try {
    const status = await fetchSellerOnboardingStatus();
    if (!isExistingSellerAccount(status)) return 'onboarding';
    useSellerStore.getState().grantExistingSellerAccess();
    return 'home';
  } catch {
    return 'unknown';
  }
}

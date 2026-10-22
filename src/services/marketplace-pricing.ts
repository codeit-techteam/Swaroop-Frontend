import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import { checkoutErrorMessage, toBackendPaymentOption } from '@/services/checkout';
import { useAuthStore } from '@/store/auth-store';
import type { PaymentMethodId } from '@/types/payment';

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type MarketplacePricingEstimate = {
  binding: boolean;
  currency: string;
  unitPricePerMt: string;
  unitPricePerKg: string;
  quantity: string;
  paymentMethod: string;
  note?: string | null;
  amounts: null | {
    /* reserved — prefer exTax/tax/inclusiveTotal when present */
  };
  exTax?: {
    material: string;
    discount: string;
    freight: string;
    platformFee: string;
    taxable: string;
  };
  tax?: {
    bps: number;
    amount: string;
  };
  inclusiveTotal?: string;
};

/**
 * Non-binding estimate — guests use public marketplace; signed-in customers
 * use the authenticated mirror. Never converts foreign currency to INR.
 */
export async function estimateMarketplacePricing(input: {
  offerId: string;
  quantity: number | string;
  paymentId?: PaymentMethodId;
}): Promise<MarketplacePricingEstimate> {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    await ensureDevBackendSession('customer');
  }
  const base = token ? '/customer/marketplace' : '/public/marketplace';

  const quantity =
    typeof input.quantity === 'number'
      ? String(input.quantity)
      : String(input.quantity).trim();

  try {
    const payload = await apiClient.post<Envelope<MarketplacePricingEstimate>>(
      `${base}/pricing/estimate`,
      {
        offerId: input.offerId,
        quantity,
        ...(input.paymentId
          ? { paymentMethod: toBackendPaymentOption(input.paymentId) }
          : {}),
      },
    );
    const data = payload.data.data;
    if (!data?.unitPricePerMt || !data?.unitPricePerKg) {
      throw new Error('Pricing estimate unavailable');
    }
    return data;
  } catch (error) {
    throw new Error(checkoutErrorMessage(error, 'Unable to estimate pricing'));
  }
}

/** Decimal-safe INR display from API money strings (no silent FX conversion). */
export function formatEstimateMoney(
  value: string | number | null | undefined,
  options?: { maxFractionDigits?: number },
): string {
  if (value == null || value === '') return '—';
  const raw = typeof value === 'number' ? value.toFixed(4) : String(value).trim();
  if (!raw || raw === 'NaN') return '—';
  const negative = raw.startsWith('-');
  const unsigned = negative ? raw.slice(1) : raw;
  const [intPart = '0', fracPart = ''] = unsigned.split('.');
  const maxFrac = options?.maxFractionDigits ?? 4;
  const trimmedFrac = fracPart.replace(/0+$/, '').slice(0, maxFrac);
  const intFormatted = Number(intPart).toLocaleString('en-IN');
  const body = trimmedFrac ? `${intFormatted}.${trimmedFrac}` : intFormatted;
  return `${negative ? '-' : ''}₹${body}`;
}

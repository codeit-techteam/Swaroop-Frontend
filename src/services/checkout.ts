import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import type { PaymentMethodId } from '@/types/payment';
import type {
  CartQuoteResult,
  CheckoutAddress,
  CheckoutPaymentOption,
  CheckoutQuote,
  PlacePurchaseRequestResult,
  PlatformPaymentOptionCode,
} from '@/types/checkout-quote';
import { commerceErrorCopy, isNetworkError } from '@/utils/commerce-errors';

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
  details?: { latestQuote?: CheckoutQuote };
};

export const toBackendPaymentOption = (id: PaymentMethodId): PlatformPaymentOptionCode => {
  switch (id) {
    case 'on_loading':
      return 'ON_LOADING';
    case 'on_delivery':
      return 'ON_DELIVERY';
    case 'credit_15':
      return 'CREDIT_15';
    case 'credit_30':
      return 'CREDIT_30';
    default:
      return 'ADVANCE';
  }
};

export const toUiPaymentOption = (code?: string | null): PaymentMethodId => {
  const key = (code ?? '').toUpperCase();
  if (key.includes('LOAD')) return 'on_loading';
  if (key.includes('DELIV')) return 'on_delivery';
  if (key.includes('30')) return 'credit_30';
  if (key.includes('CREDIT')) return 'credit_15';
  return 'advance';
};

export function checkoutErrorCode(error: unknown): string | null {
  if (isNetworkError(error)) {
    return 'NETWORK_ERROR';
  }
  if (isAxiosError<Envelope<unknown>>(error)) {
    const code = error.response?.data?.code;
    if (typeof code === 'string' && code) {
      return code;
    }
    if (!error.response) {
      return 'NETWORK_ERROR';
    }
  }
  return null;
}

export function checkoutErrorMessage(error: unknown, fallback: string): string {
  const code = checkoutErrorCode(error);
  if (code) {
    return commerceErrorCopy(code, fallback).message;
  }
  if (isAxiosError<Envelope<unknown>>(error)) {
    const payload = error.response?.data;
    if (typeof payload?.message === 'string' && payload.message) {
      return payload.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function checkoutLatestQuote(error: unknown): CheckoutQuote | null {
  if (isAxiosError<Envelope<unknown>>(error)) {
    return error.response?.data?.details?.latestQuote ?? null;
  }
  return null;
}

export async function fetchCheckoutAddresses(): Promise<CheckoutAddress[]> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<CheckoutAddress[]>>('/customer/checkout/addresses');
  return payload.data.data ?? [];
}

export async function fetchCheckoutPaymentOptions(amount?: number): Promise<{
  options: CheckoutPaymentOption[];
  credit: { eligible: boolean; approvedLimit: string; availableLimit: string };
}> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<
    Envelope<{
      options: CheckoutPaymentOption[];
      credit: { eligible: boolean; approvedLimit: string; availableLimit: string };
    }>
  >('/customer/checkout/payment-options', {
    params: amount != null ? { amount } : undefined,
  });
  return payload.data.data;
}

export async function createCheckoutQuote(input: {
  productId?: string;
  offerId?: string;
  quantity: number;
  paymentOption: PlatformPaymentOptionCode;
  shippingAddressId?: string;
  billingAddressId?: string;
}): Promise<CheckoutQuote> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<CheckoutQuote>>('/customer/checkout/quote', input);
  return payload.data.data;
}

export async function fetchCheckoutQuote(quoteId: string): Promise<CheckoutQuote> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<CheckoutQuote>>(
    `/customer/checkout/quotes/${quoteId}`,
  );
  return payload.data.data;
}

export async function quoteCartForCheckout(input?: {
  paymentOption?: PlatformPaymentOptionCode;
  shippingAddressId?: string;
  billingAddressId?: string;
  expectedPrices?: Array<{ cartItemId: string; unitPrice: number }>;
}): Promise<CartQuoteResult> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<CartQuoteResult>>(
    '/customer/checkout/quote-from-cart',
    input ?? {},
  );
  return payload.data.data;
}

export async function placePurchaseRequestFromQuote(input: {
  quoteId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  idempotencyKey: string;
  notes?: string;
}): Promise<PlacePurchaseRequestResult> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<
    Envelope<{ purchaseRequests: PlacePurchaseRequestResult[]; idempotent?: boolean }>
  >('/customer/purchase-requests', input);
  const first = payload.data.data.purchaseRequests?.[0];
  if (!first) {
    throw new Error('Purchase request was not created');
  }
  return first;
}

export async function fetchCustomerPurchaseRequests(): Promise<PlacePurchaseRequestResult[]> {
  await ensureDevBackendSession('customer');
  const pages: PlacePurchaseRequestResult[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const payload = await apiClient.get<
      Envelope<PlacePurchaseRequestResult[]> & { meta?: { totalPages?: number } }
    >('/customer/purchase-requests', { params: { page, limit: 50 } });
    pages.push(...(payload.data.data ?? []));
    totalPages = payload.data.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  return pages;
}

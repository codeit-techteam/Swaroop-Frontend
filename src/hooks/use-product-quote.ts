import { useCallback, useEffect, useRef, useState } from 'react';

import {
  checkoutErrorMessage,
  createCheckoutQuote,
  fetchCheckoutPaymentOptions,
  toBackendPaymentOption,
} from '@/services/checkout';
import type { CheckoutQuote } from '@/types/checkout-quote';
import type { PaymentMethodId } from '@/types/payment';
import type {
  CreditAccessView,
  CreditLoadState,
  ProductCreditConfig,
} from '@/types/payment-eligibility';
import { CREDIT_LOAD_ERROR } from '@/types/payment-eligibility';
import type { ProductPaymentOption } from '@/types/product';
import { mapBackendPaymentOptions } from '@/utils/map-backend-payment-options';

export { mapBackendPaymentOptions };

type UseProductQuoteArgs = {
  productId: string | null;
  offerId?: string | null;
  quantity: number;
  paymentId: PaymentMethodId;
  enabled: boolean;
  amount?: number;
};

type QuotedState = {
  productId: string;
  value: CheckoutQuote;
};

export function useProductQuote({
  productId,
  offerId,
  quantity,
  paymentId,
  enabled,
  amount,
}: UseProductQuoteArgs) {
  const [quoted, setQuoted] = useState<QuotedState | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<ProductPaymentOption[]>([]);
  const [creditAccess, setCreditAccess] = useState<CreditAccessView | null>(null);
  const [productCredit, setProductCredit] = useState<ProductCreditConfig | null>(null);
  const [creditStatus, setCreditStatus] = useState<CreditLoadState>('idle');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const creditSeq = useRef(0);
  const quotedRef = useRef<QuotedState | null>(null);

  useEffect(() => {
    quotedRef.current = quoted;
  }, [quoted]);

  const quote = productId && quoted?.productId === productId ? quoted.value : null;

  const refresh = useCallback(async () => {
    if (!enabled || !productId || !(quantity > 0)) {
      return;
    }
    const seq = ++requestSeq.current;
    const keepPrevious = quotedRef.current?.productId === productId;
    if (keepPrevious) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const next = await createCheckoutQuote({
        productId,
        offerId: offerId ?? undefined,
        quantity,
        paymentOption: toBackendPaymentOption(paymentId),
      });
      if (seq !== requestSeq.current) {
        return;
      }
      setQuoted({ productId, value: next });
      setError(null);
    } catch (cause) {
      if (seq !== requestSeq.current) {
        return;
      }
      if (!keepPrevious) {
        setQuoted(null);
      }
      setError(checkoutErrorMessage(cause, 'Unable to load latest pricing'));
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [enabled, offerId, paymentId, productId, quantity]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void refresh();
    }, 160);
    return () => clearTimeout(handle);
  }, [refresh]);

  const loadCredit = useCallback(() => {
    if (!enabled) {
      return Promise.resolve();
    }
    const seq = ++creditSeq.current;
    return fetchCheckoutPaymentOptions({
      amount: amount && amount > 0 ? amount : undefined,
      productId: productId ?? undefined,
      offerId: offerId ?? undefined,
    })
      .then((result) => {
        if (seq !== creditSeq.current) return;
        setPaymentOptions(mapBackendPaymentOptions(result.options));
        setProductCredit(result.productCredit ?? null);
        setCreditAccess(result.credit);
        setCreditStatus('ready');
      })
      .catch(() => {
        if (seq !== creditSeq.current) return;
        setPaymentOptions([]);
        setCreditAccess(CREDIT_LOAD_ERROR);
        setCreditStatus('error');
      });
  }, [amount, enabled, offerId, productId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handle = setTimeout(() => {
      void loadCredit();
    }, 200);
    return () => {
      creditSeq.current += 1;
      clearTimeout(handle);
    };
  }, [enabled, loadCredit]);

  const resolvedCreditStatus: CreditLoadState = !enabled
    ? 'idle'
    : creditStatus === 'idle'
      ? 'loading'
      : creditStatus;

  return {
    quote,
    paymentOptions: enabled ? paymentOptions : [],
    creditAccess: enabled ? creditAccess : null,
    productCredit,
    creditStatus: resolvedCreditStatus,
    loading,
    refreshing,
    error,
    refresh,
    refreshCredit: () => {
      if (!enabled) return;
      setCreditStatus('loading');
      void loadCredit();
    },
  };
}

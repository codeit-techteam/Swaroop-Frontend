import { useCallback, useEffect, useRef, useState } from 'react';

import {
  checkoutErrorMessage,
  createCheckoutQuote,
  fetchCheckoutPaymentOptions,
  toBackendPaymentOption,
} from '@/services/checkout';
import type { CheckoutPaymentOption, CheckoutQuote } from '@/types/checkout-quote';
import type { PaymentMethodId } from '@/types/payment';
import type { ProductPaymentOption } from '@/types/product';

type UseProductQuoteArgs = {
  productId: string | null;
  offerId?: string | null;
  quantity: number;
  paymentId: PaymentMethodId;
  enabled: boolean;
};

export function mapBackendPaymentOptions(
  options: CheckoutPaymentOption[],
): ProductPaymentOption[] {
  return options.map((option) => {
    const id =
      option.paymentOption === 'ON_LOADING'
        ? 'on_loading'
        : option.paymentOption === 'ON_DELIVERY'
          ? 'on_delivery'
          : option.paymentOption === 'CREDIT_30' || option.paymentOption === 'CREDIT'
            ? 'credit_30'
            : option.paymentOption === 'CREDIT_15'
              ? 'credit_15'
              : 'advance';
    return {
      id,
      title: option.title,
      description: option.description,
      benefitLabel: option.benefitLabel,
      discountRate: option.discountBps ? option.discountBps / 10000 : undefined,
      eligible: option.eligible,
    };
  });
}

export function useProductQuote({
  productId,
  offerId,
  quantity,
  paymentId,
  enabled,
}: UseProductQuoteArgs) {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<ProductPaymentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled || !productId || !(quantity > 0)) {
      return;
    }
    const seq = ++requestSeq.current;
    setLoading(true);
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
      setQuote(next);
    } catch (cause) {
      if (seq !== requestSeq.current) {
        return;
      }
      setQuote(null);
      setError(checkoutErrorMessage(cause, 'Unable to load latest pricing'));
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, [enabled, offerId, paymentId, productId, quantity]);

  useEffect(() => {
    const handle = setTimeout(() => {
      void refresh();
    }, 250);
    return () => clearTimeout(handle);
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    void fetchCheckoutPaymentOptions()
      .then((result) => {
        if (!cancelled) {
          setPaymentOptions(mapBackendPaymentOptions(result.options));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPaymentOptions([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { quote, paymentOptions, loading, error, refresh };
}

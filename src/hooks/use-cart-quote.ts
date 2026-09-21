import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { quoteCartForCheckout, checkoutErrorCode, checkoutErrorMessage } from '@/services/checkout';
import type { CartQuoteResult, CheckoutQuote } from '@/types/checkout-quote';
import type { CartItem, CartOrderSummary } from '@/types/product';
import { emptyCartSummary } from '@/store/cart-store';
import { commerceErrorCopy } from '@/utils/commerce-errors';
import { moneyNumber } from '@/utils/money';

const quoteSummary = (quotes: CheckoutQuote[], items: CartItem[]): CartOrderSummary => {
  if (quotes.length === 0) {
    return emptyCartSummary(items);
  }

  const sum = (pick: (quote: CheckoutQuote) => string) =>
    quotes.reduce((total, quote) => total + (moneyNumber(pick(quote)) ?? 0), 0);

  const taxRate = quotes[0]?.taxRate;
  return {
    baseSubtotal: sum((quote) => quote.baseAmount),
    discount: sum((quote) => quote.discountAmount),
    freight: sum((quote) => quote.freightAmount),
    gst: sum((quote) => quote.taxAmount),
    gstLabel: taxRate ? `GST (${Number(taxRate)}%)` : 'GST',
    platformFee: sum((quote) => quote.platformFee),
    insuranceIncluded: quotes.every((quote) => quote.insuranceIncluded),
    insuranceAmount: sum((quote) => quote.insuranceAmount),
    totalLandedCost: sum((quote) => quote.totalAmount),
    totalQuantityMt: sum((quote) => quote.quantity),
    meetsMoq: items.length > 0 && items.every((item) => item.quantityMt >= item.moq),
    fromQuote: true,
  };
};

type UseCartQuoteArgs = {
  items: CartItem[];
  enabled: boolean;
  shippingAddressId?: string;
};

export function useCartQuote({ items, enabled, shippingAddressId }: UseCartQuoteArgs) {
  const [result, setResult] = useState<CartQuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const itemSignature = items
    .map((item) => `${item.backendItemId ?? item.id}:${item.quantityMt}:${item.offerId ?? ''}`)
    .join('|');

  const refresh = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (!enabled || currentItems.length === 0) {
      setResult(null);
      setError(null);
      setErrorCode(null);
      setLoading(false);
      return null;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const expectedPrices = currentItems
        .filter((item) => item.backendItemId)
        .map((item) => ({
          cartItemId: item.backendItemId as string,
          unitPrice: item.unitPricePerMt,
        }));
      const next = await quoteCartForCheckout({
        expectedPrices: expectedPrices.length > 0 ? expectedPrices : undefined,
        shippingAddressId,
      });
      if (seq !== requestSeq.current) {
        return next;
      }
      setResult(next);
      if (!next.valid && next.status === 'INVALID') {
        const issue = next.issues[0];
        const copy = commerceErrorCopy(issue?.code, issue?.message ?? 'Unable to refresh pricing');
        setErrorCode(copy.code);
        setError(copy.message);
      }
      return next;
    } catch (cause) {
      if (seq !== requestSeq.current) {
        return null;
      }
      setResult(null);
      setErrorCode(checkoutErrorCode(cause) ?? 'NETWORK_ERROR');
      setError(checkoutErrorMessage(cause, 'Unable to refresh pricing'));
      return null;
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, [enabled, itemSignature, shippingAddressId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handle = setTimeout(() => {
      void refresh();
    }, 280);
    return () => clearTimeout(handle);
  }, [enabled, refresh]);

  const summary = useMemo(
    () => quoteSummary(result?.quotes ?? [], items),
    [items, result?.quotes],
  );

  return {
    result,
    quotes: result?.quotes ?? [],
    quote: result?.quote ?? null,
    changes: result?.changes ?? [],
    status: result?.status ?? null,
    summary,
    loading,
    error,
    errorCode,
    refresh,
  };
}

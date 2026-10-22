import { useEffect, useRef, useState } from 'react';

import {
  estimateMarketplacePricing,
  type MarketplacePricingEstimate,
} from '@/services/marketplace-pricing';
import type { PaymentMethodId } from '@/types/payment';

type Args = {
  offerId?: string | null;
  quantity: number;
  paymentId?: PaymentMethodId;
  enabled?: boolean;
};

export function useMarketplacePricingEstimate({
  offerId,
  quantity,
  paymentId,
  enabled = true,
}: Args) {
  const [estimate, setEstimate] = useState<MarketplacePricingEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!enabled || !offerId || !(quantity > 0)) {
      setEstimate(null);
      setError(null);
      return;
    }

    const requestId = ++seq.current;
    const timer = setTimeout(() => {
      setLoading(true);
      void estimateMarketplacePricing({
        offerId,
        quantity,
        paymentId,
      })
        .then((next) => {
          if (requestId !== seq.current) return;
          setEstimate(next);
          setError(null);
        })
        .catch((cause: unknown) => {
          if (requestId !== seq.current) return;
          setEstimate(null);
          setError(cause instanceof Error ? cause.message : 'Unable to estimate pricing');
        })
        .finally(() => {
          if (requestId === seq.current) {
            setLoading(false);
          }
        });
    }, 280);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled, offerId, paymentId, quantity]);

  return { estimate, loading, error };
}

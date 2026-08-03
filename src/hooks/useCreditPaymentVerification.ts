import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  buildCreditVerificationTimeline,
  CREDIT_WORKFLOW_COPY,
} from '@/constants/creditWorkflow';
import { getRouteAfterPaymentVerification } from '@/constants/paymentNavigation';
import { DEMO_MODE, DEMO_VERIFICATION_DELAY_MS } from '@/constants/verificationStatus';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectPaymentProof,
  useOrderStore,
} from '@/store/order-store';
import type { VerificationBadgeStatus } from '@/types/paymentVerification';

type UseCreditPaymentVerificationResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  paymentProof: ReturnType<typeof selectPaymentProof>;
  timeline: ReturnType<typeof buildCreditVerificationTimeline>;
  badgeStatus: VerificationBadgeStatus;
  isVerified: boolean;
  handleBack: () => void;
};

export const useCreditPaymentVerification = (): UseCreditPaymentVerificationResult => {
  const router = useRouter();
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const order = useOrderStore(selectCurrentOrder);
  const paymentProof = useOrderStore(selectPaymentProof);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const restoreCredit = useOrderStore((state) => state.restoreCredit);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  const isVerified = order?.verificationStatus === 'verified';

  const timeline = useMemo(
    () => buildCreditVerificationTimeline(order ?? ({} as NonNullable<typeof order>), Boolean(paymentProof)),
    [order, paymentProof],
  );

  const badgeStatus: VerificationBadgeStatus = isVerified ? 'verified' : 'pending_verification';

  useEffect(() => {
    if (!DEMO_MODE || !order || !paymentProof || isVerified) {
      return;
    }

    demoTimerRef.current = setTimeout(() => {
      restoreCredit();
      const nextOrder = useOrderStore.getState().currentOrder;
      if (nextOrder) {
        router.replace(getRouteAfterPaymentVerification(nextOrder));
      }
    }, DEMO_VERIFICATION_DELAY_MS);

    return () => {
      if (demoTimerRef.current) {
        clearTimeout(demoTimerRef.current);
      }
    };
  }, [isVerified, order, paymentProof, restoreCredit, router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.CREDIT_UPLOAD_PROOF as Href);
  }, [router]);

  return {
    order,
    paymentProof,
    timeline,
    badgeStatus,
    isVerified,
    handleBack,
  };
};

export { CREDIT_WORKFLOW_COPY };

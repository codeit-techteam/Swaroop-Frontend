import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  DEMO_MODE,
  DEMO_VERIFICATION_DELAY_MS,
  VERIFICATION_SCREEN_COPY,
  VERIFICATION_TIMELINE_STEP_IDS,
} from '@/constants/verificationStatus';
import { ROUTES } from '@/navigation/routes';
import { useAuthStore } from '@/store/auth-store';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  selectPaymentProof,
  useOrderStore,
} from '@/store/order-store';
import type { Order, OrderVerificationStatus, PaymentProof } from '@/types/order';
import type {
  VerificationBadgeStatus,
  VerificationErrorState,
  VerificationTimelineItem,
} from '@/types/paymentVerification';
import { formatDateTime } from '@/utils/date';

type UsePaymentVerificationResult = {
  order: Order | null;
  paymentProof: PaymentProof | null;
  user: ReturnType<typeof useAuthStore.getState>['userProfile'];
  timeline: VerificationTimelineItem[];
  badgeStatus: VerificationBadgeStatus;
  verificationError: VerificationErrorState | null;
  isDemoMode: boolean;
  isVerified: boolean;
  handleGoToOrders: () => void;
  handleBack: () => void;
};

const mapVerificationStatusToBadge = (
  status: OrderVerificationStatus | undefined,
): VerificationBadgeStatus => {
  switch (status) {
    case 'verified':
      return 'verified';
    case 'rejected':
      return 'rejected';
    case 'needs_review':
      return 'needs_review';
    case 'pending':
    default:
      return 'pending_verification';
  }
};

const buildTimeline = (
  paymentProof: PaymentProof | null,
  verificationStatus: OrderVerificationStatus | undefined,
): VerificationTimelineItem[] => {
  const isVerified = verificationStatus === 'verified';
  const isFinanceCurrent = !isVerified && verificationStatus === 'pending';
  const screenshotTime = paymentProof?.submittedAt
    ? `Completed at ${formatDateTime(paymentProof.submittedAt, 'hh:mm A')}`
    : 'Completed';

  return [
    {
      id: VERIFICATION_TIMELINE_STEP_IDS.SCREENSHOT_UPLOADED,
      title: 'Payment Screenshot Uploaded',
      subtitle: screenshotTime,
      status: 'completed',
    },
    {
      id: VERIFICATION_TIMELINE_STEP_IDS.UTR_SUBMITTED,
      title: 'UTR Submitted',
      subtitle: paymentProof ? `UTR: ${paymentProof.utr}` : undefined,
      status: 'completed',
    },
    {
      id: VERIFICATION_TIMELINE_STEP_IDS.FINANCE_VERIFICATION,
      title: isFinanceCurrent ? 'Finance Verification (Ongoing)' : 'Finance Verification',
      subtitle: isVerified
        ? 'Verified successfully'
        : isFinanceCurrent
          ? VERIFICATION_SCREEN_COPY.financeInProgress
          : VERIFICATION_SCREEN_COPY.financeInProgress,
      status: isVerified ? 'completed' : isFinanceCurrent ? 'current' : 'pending',
    },
    {
      id: VERIFICATION_TIMELINE_STEP_IDS.ORDER_SUBMISSION,
      title: 'Order Submission',
      subtitle: VERIFICATION_SCREEN_COPY.orderSubmissionPending,
      status: isVerified ? 'current' : 'pending',
    },
  ];
};

export const usePaymentVerification = (): UsePaymentVerificationResult => {
  const router = useRouter();
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const order = useOrderStore(selectCurrentOrder);
  const paymentProof = useOrderStore(selectPaymentProof);
  const user = useAuthStore((state) => state.userProfile);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const updateOrder = useOrderStore((state) => state.updateOrder);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  const badgeStatus = useMemo(
    () => mapVerificationStatusToBadge(order?.verificationStatus),
    [order?.verificationStatus],
  );

  const timeline = useMemo(
    () => buildTimeline(paymentProof, order?.verificationStatus),
    [order?.verificationStatus, paymentProof],
  );

  const isVerified = order?.verificationStatus === 'verified';

  const verificationError = useMemo<VerificationErrorState | null>(() => {
    if (order?.verificationStatus !== 'rejected') {
      return null;
    }

    return {
      code: 'verification_failed',
      title: 'Verification Failed',
      message: 'Your payment could not be verified. Please review the details or contact support.',
    };
  }, [order?.verificationStatus]);

  useEffect(() => {
    if (!DEMO_MODE || !order || !paymentProof || isVerified) {
      return;
    }

    demoTimerRef.current = setTimeout(() => {
      updateOrder({
        verificationStatus: 'verified',
        paymentStatus: 'verified',
      });
      router.replace(ROUTES.CUSTOMER.ORDER_CONFIRMATION as Href);
    }, DEMO_VERIFICATION_DELAY_MS);

    return () => {
      if (demoTimerRef.current) {
        clearTimeout(demoTimerRef.current);
      }
    };
  }, [isVerified, order, paymentProof, router, updateOrder]);

  const handleGoToOrders = useCallback(() => {
    if (DEMO_MODE) {
      router.replace(ROUTES.CUSTOMER.ORDER_CONFIRMATION as Href);
      return;
    }

    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  return {
    order,
    paymentProof,
    user,
    timeline,
    badgeStatus,
    verificationError,
    isDemoMode: DEMO_MODE,
    isVerified,
    handleGoToOrders,
    handleBack,
  };
};

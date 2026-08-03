import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import { formatCreditLimit, getCreditDays } from '@/constants/creditWorkflow';
import { getPaymentMethodById } from '@/constants/payment';
import { CREDIT_ELIGIBILITY_APPROVED } from '@/constants/paymentNavigation';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';
import type { PaymentMethodId } from '@/types/payment';

type CreditApprovalDetails = {
  creditType: string;
  approvedLimit: string;
  availableLimit: string;
  interest: string;
  dueAfterDelivery: string;
};

type UseCreditApprovalResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  details: CreditApprovalDetails | null;
  isApproved: boolean;
  handleContinue: () => void;
  handleBack: () => void;
};

const buildCreditDetails = (
  methodId: PaymentMethodId,
  creditLimit: number,
  availableLimit: number,
  interestRate: number,
): CreditApprovalDetails => {
  const days = getCreditDays(methodId);
  return {
    creditType: `${days} Days`,
    approvedLimit: formatCreditLimit(creditLimit),
    availableLimit: formatCreditLimit(availableLimit),
    interest: `${interestRate}%`,
    dueAfterDelivery: `${days} Days`,
  };
};

export const useCreditApproval = (): UseCreditApprovalResult => {
  const router = useRouter();
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const approveCredit = useOrderStore((state) => state.approveCredit);
  const updateOrder = useOrderStore((state) => state.updateOrder);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (order && CREDIT_ELIGIBILITY_APPROVED && !order.credit?.creditApproved) {
      approveCredit();
    }
  }, [approveCredit, order]);

  const details = order?.credit
    ? buildCreditDetails(
        order.paymentMethodId,
        order.credit.creditLimit,
        order.credit.availableLimit,
        order.credit.interestRate,
      )
    : order
      ? (() => {
          const method = getPaymentMethodById(order.paymentMethodId);
          return buildCreditDetails(
            order.paymentMethodId,
            method.creditLimit ?? 5_000_000,
            method.availableCredit ?? 3_750_000,
            method.interestRate,
          );
        })()
      : null;

  const handleContinue = useCallback(() => {
    if (order) {
      updateOrder({
        credit: order.credit
          ? { ...order.credit, workflowPhase: 'submitted' }
          : order.credit,
      });
    }
    router.replace(ROUTES.CUSTOMER.ORDER_SUBMITTED as Href);
  }, [order, router, updateOrder]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [router]);

  return {
    order,
    details,
    isApproved: CREDIT_ELIGIBILITY_APPROVED,
    handleContinue,
    handleBack,
  };
};

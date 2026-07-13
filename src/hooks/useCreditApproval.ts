import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import { CREDIT_ELIGIBILITY_APPROVED } from '@/constants/paymentNavigation';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseCreditApprovalResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  isApproved: boolean;
  isChecking: boolean;
  handleContinue: () => void;
  handleBack: () => void;
};

export const useCreditApproval = (): UseCreditApprovalResult => {
  const router = useRouter();
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (CREDIT_ELIGIBILITY_APPROVED && order) {
      const timer = setTimeout(() => {
        router.replace(ROUTES.CUSTOMER.ORDER_SUBMITTED as Href);
      }, 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [order, router]);

  const handleContinue = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.ORDER_SUBMITTED as Href);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [router]);

  return {
    order,
    isApproved: CREDIT_ELIGIBILITY_APPROVED,
    isChecking: !CREDIT_ELIGIBILITY_APPROVED,
    handleContinue,
    handleBack,
  };
};

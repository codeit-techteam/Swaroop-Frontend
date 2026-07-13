import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UsePaymentSuccessResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  handleContinue: () => void;
  handleBack: () => void;
};

export const usePaymentSuccess = (): UsePaymentSuccessResult => {
  const router = useRouter();
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  const handleContinue = useCallback(() => {
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handleBack = useCallback(() => {
    handleContinue();
  }, [handleContinue]);

  return {
    order,
    handleContinue,
    handleBack,
  };
};

import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UsePaymentReminderResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  handlePayNow: () => void;
  handleBack: () => void;
};

export const usePaymentReminder = (): UsePaymentReminderResult => {
  const router = useRouter();
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  const handlePayNow = useCallback(() => {
    router.push(ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  return {
    order,
    handlePayNow,
    handleBack,
  };
};

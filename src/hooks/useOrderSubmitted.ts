import { useCallback, useEffect } from 'react';

import { type Href, useRouter } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import { selectCheckoutAddress, useCheckoutStore } from '@/store/checkout-store';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseOrderSubmittedResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  destination: string;
  handleContinue: () => void;
  handleBack: () => void;
  handleNotifications: () => void;
};

export const useOrderSubmitted = (): UseOrderSubmittedResult => {
  const router = useRouter();
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const startProcurement = useOrderStore((state) => state.startProcurement);
  const checkoutAddress = useCheckoutStore(selectCheckoutAddress);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  const destination =
    order?.destination || `${checkoutAddress.line2}, ${checkoutAddress.state}`;

  const handleContinue = useCallback(() => {
    if (order) {
      startProcurement();
    }
    router.replace(ROUTES.CUSTOMER.PROCUREMENT_CONFIRMATION as Href);
  }, [order, router, startProcurement]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [router]);

  const handleNotifications = useCallback(() => {
    router.push(ROUTES.CUSTOMER.NOTIFICATIONS as Href);
  }, [router]);

  return {
    order,
    destination,
    handleContinue,
    handleBack,
    handleNotifications,
  };
};

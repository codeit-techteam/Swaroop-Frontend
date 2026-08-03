import { useCallback, useEffect } from 'react';

import { Alert } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import {
  CREDIT_WORKFLOW_COPY,
  formatCreditDate,
  getCreditCountdownParts,
  getCreditDays,
} from '@/constants/creditWorkflow';
import { formatPaymentCurrency } from '@/constants/payment';
import { getRouteAfterCreditPaymentReminder } from '@/constants/paymentNavigation';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseCreditPaymentReminderResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  reminderTitle: string;
  invoiceAmount: string;
  dueDate: string;
  creditType: string;
  handlePayNow: () => void;
  handleContactSupport: () => void;
  handleBack: () => void;
};

export const useCreditPaymentReminder = (): UseCreditPaymentReminderResult => {
  const router = useRouter();
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  const countdown = getCreditCountdownParts(order?.credit?.dueDate ?? null);
  const copy = CREDIT_WORKFLOW_COPY.reminder;

  const reminderTitle = countdown.isDueToday
    ? copy.dueToday
    : copy.daysRemaining(countdown.daysRemaining);

  const handlePayNow = useCallback(() => {
    router.push(getRouteAfterCreditPaymentReminder());
  }, [router]);

  const handleContactSupport = useCallback(() => {
    Alert.alert('Contact Support', 'Our finance team is available Mon–Sat, 9 AM – 6 PM IST.', [
      { text: 'OK' },
    ]);
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.CREDIT_COUNTDOWN as Href);
  }, [router]);

  return {
    order,
    reminderTitle,
    invoiceAmount: order ? formatPaymentCurrency(order.amount) : '—',
    dueDate: order?.credit?.dueDate ? formatCreditDate(order.credit.dueDate) : '—',
    creditType: order ? `${getCreditDays(order.paymentMethodId)} Days` : '—',
    handlePayNow,
    handleContactSupport,
    handleBack,
  };
};

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { type Href, useRouter } from 'expo-router';

import {
  createDeliveryCompletedPatch,
  createDeliveryDetails,
  createDeliveryProofState,
  createDeliveryReceiverDetails,
  createDeliverySummary,
  createDigitalPodState,
  formatDeliveryDate,
  formatDeliveryTime,
} from '@/constants/deliveryCompleted';
import {
  formatCreditDate,
  getCreditPaymentMethodLabel,
} from '@/constants/creditWorkflow';
import { getRouteAfterCreditInvoice } from '@/constants/paymentNavigation';
import { ROUTES } from '@/navigation/routes';
import {
  selectCurrentOrder,
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';

type UseCreditInvoiceDeliveryResult = {
  order: ReturnType<typeof selectCurrentOrder>;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  paymentMethodLabel: string;
  deliveredTime: string;
  handleBack: () => void;
  handleContinue: () => void;
  handleDownloadDocument: (docType: string) => void;
};

export const useCreditInvoiceDelivery = (): UseCreditInvoiceDeliveryResult => {
  const router = useRouter();
  const hasSyncedRef = useRef(false);
  const order = useOrderStore(selectCurrentOrder);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const updateOrder = useOrderStore((state) => state.updateOrder);
  const markDelivered = useOrderStore((state) => state.markDelivered);
  const generateCreditInvoice = useOrderStore((state) => state.generateCreditInvoice);
  const startCreditCountdown = useOrderStore((state) => state.startCreditCountdown);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  useEffect(() => {
    if (!order || hasSyncedRef.current) {
      return;
    }

    hasSyncedRef.current = true;
    const deliveredAt = order.deliveredAt ?? new Date().toISOString();
    const deliveryPatch = createDeliveryCompletedPatch(order, deliveredAt);

    if (order.status !== 'DELIVERED') {
      markDelivered();
    }

    updateOrder({
      ...deliveryPatch,
      deliveryDetails: createDeliveryDetails(deliveredAt),
      deliveryProof: order.deliveryProof ?? createDeliveryProofState(),
      deliveryReceiver: order.deliveryReceiver ?? createDeliveryReceiverDetails(order),
      digitalPod: order.digitalPod ?? createDigitalPodState(order, deliveredAt),
      deliverySummary: order.deliverySummary ?? createDeliverySummary(order),
    });

    if (!order.credit?.invoiceNumber) {
      generateCreditInvoice();
    }
  }, [generateCreditInvoice, markDelivered, order, updateOrder]);

  const currentOrder = useOrderStore(selectCurrentOrder);

  const deliveredTime = useMemo(() => {
    const at = currentOrder?.deliveredAt;
    if (!at) {
      return '—';
    }
    return `${formatDeliveryDate(at)} · ${formatDeliveryTime(at)}`;
  }, [currentOrder?.deliveredAt]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.ORDERS as Href);
  }, [router]);

  const handleContinue = useCallback(() => {
    startCreditCountdown();
    router.push(getRouteAfterCreditInvoice());
  }, [router, startCreditCountdown]);

  const handleDownloadDocument = useCallback((_docType: string) => {
    // Mock download — replace with API later
  }, []);

  return {
    order: currentOrder,
    invoiceNumber: currentOrder?.credit?.invoiceNumber ?? null,
    invoiceDate: currentOrder?.credit?.invoiceDate
      ? formatCreditDate(currentOrder.credit.invoiceDate)
      : null,
    dueDate: currentOrder?.credit?.dueDate
      ? formatCreditDate(currentOrder.credit.dueDate)
      : null,
    paymentMethodLabel: currentOrder ? getCreditPaymentMethodLabel(currentOrder) : '',
    deliveredTime,
    handleBack,
    handleContinue,
    handleDownloadDocument,
  };
};

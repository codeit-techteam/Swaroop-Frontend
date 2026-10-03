import type { Href } from 'expo-router';

import {
  CREDIT_REMINDER_THRESHOLD_DAYS,
  getCreditCountdownParts,
} from '@/constants/creditWorkflow';
import { ROUTES } from '@/navigation/routes';
import type { Order } from '@/types/order';
import type { PaymentMethodId } from '@/types/payment';

/** Demo: credit eligibility pre-approved for returning buyers. */
export const CREDIT_ELIGIBILITY_APPROVED = true;

export const getRouteAfterPaymentSelection = (methodId: PaymentMethodId): Href => {
  switch (methodId) {
    case 'advance':
      return ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href;
    case 'on_loading':
    case 'on_delivery':
      return ROUTES.CUSTOMER.ORDER_SUBMITTED as Href;
    case 'credit_15':
    case 'credit_30':
      return ROUTES.CUSTOMER.CREDIT_APPROVAL as Href;
    default:
      return ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF as Href;
  }
};

export const getRouteAfterPaymentVerification = (order: Order): Href => {
  switch (order.paymentMethodId) {
    case 'on_loading':
      return ROUTES.CUSTOMER.DISPATCH_STARTED as Href;
    case 'on_delivery':
      return ROUTES.CUSTOMER.PAYMENT_SUCCESS as Href;
    case 'credit_15':
    case 'credit_30':
      return ROUTES.CUSTOMER.CREDIT_RESTORED as Href;
    default:
      return ROUTES.CUSTOMER.PROCUREMENT_CONFIRMATION as Href;
  }
};

export const getRouteAfterProcurementComplete = (order: Order): Href => {
  switch (order.paymentMethodId) {
    case 'on_loading':
    case 'on_delivery':
      return ROUTES.CUSTOMER.LOADING_SCHEDULED as Href;
    case 'credit_15':
    case 'credit_30':
      return ROUTES.CUSTOMER.ORDER_AWAITING_CONFIRMATION as Href;
    default:
      return ROUTES.CUSTOMER.ORDER_AWAITING_CONFIRMATION as Href;
  }
};

export const getRouteAfterLoadingCompleted = (order: Order): Href => {
  switch (order.paymentMethodId) {
    case 'on_loading':
      return ROUTES.CUSTOMER.PAYMENT_REMINDER as Href;
    case 'on_delivery':
      return ROUTES.CUSTOMER.DISPATCH_STARTED as Href;
    case 'credit_15':
    case 'credit_30':
      return ROUTES.CUSTOMER.DISPATCH_STARTED as Href;
    default:
      return ROUTES.CUSTOMER.PAYMENT_REMINDER as Href;
  }
};

export const getRouteAfterCreditDelivery = (): Href =>
  ROUTES.CUSTOMER.CREDIT_INVOICE_DELIVERY as Href;

export const getRouteAfterCreditInvoice = (): Href => ROUTES.CUSTOMER.CREDIT_COUNTDOWN as Href;

export const getRouteAfterCreditCountdown = (order: Order): Href => {
  if (!order.credit?.dueDate) {
    return ROUTES.CUSTOMER.CREDIT_PAYMENT_REMINDER as Href;
  }
  const { daysRemaining } = getCreditCountdownParts(order.credit.dueDate);
  if (daysRemaining <= CREDIT_REMINDER_THRESHOLD_DAYS) {
    return ROUTES.CUSTOMER.CREDIT_PAYMENT_REMINDER as Href;
  }
  return ROUTES.CUSTOMER.CREDIT_COUNTDOWN as Href;
};

export const getRouteAfterCreditPaymentReminder = (): Href =>
  ROUTES.CUSTOMER.CREDIT_UPLOAD_PROOF as Href;

export const getRouteAfterCreditPaymentUpload = (): Href =>
  ROUTES.CUSTOMER.CREDIT_VERIFICATION as Href;

export const isCreditPaymentMethod = (methodId: PaymentMethodId): boolean =>
  methodId === 'credit_15' || methodId === 'credit_30';

export const requiresAdvancePaymentVerified = (order: Order | null): boolean =>
  order?.paymentMethodId === 'advance';

export const isDeferredPaymentFlow = (methodId: PaymentMethodId): boolean =>
  methodId === 'on_loading' ||
  methodId === 'on_delivery' ||
  methodId === 'credit_15' ||
  methodId === 'credit_30';

export const getCreditPaymentTermDays = (methodId: PaymentMethodId): number => {
  if (methodId === 'credit_30') {
    return 30;
  }
  if (methodId === 'credit_15') {
    return 15;
  }
  return 0;
};

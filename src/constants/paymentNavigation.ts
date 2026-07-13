import type { Href } from 'expo-router';

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
    default:
      return ROUTES.CUSTOMER.PROCUREMENT_CONFIRMATION as Href;
  }
};

export const getRouteAfterProcurementComplete = (order: Order): Href => {
  switch (order.paymentMethodId) {
    case 'on_loading':
    case 'on_delivery':
      return ROUTES.CUSTOMER.LOADING_COMPLETED as Href;
    case 'credit_15':
    case 'credit_30':
      return ROUTES.CUSTOMER.PURCHASE_ORDER_GENERATED as Href;
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
    default:
      return ROUTES.CUSTOMER.PAYMENT_REMINDER as Href;
  }
};

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

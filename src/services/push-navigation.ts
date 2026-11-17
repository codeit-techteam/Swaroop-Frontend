import { importNotificationTarget } from '@/features/import/config';
import { ROUTES } from '@/navigation/routes';

export type PushAudience = 'customer' | 'seller';

export type PushNotificationData = {
  notificationId?: string;
  entityType?: string;
  entityId?: string;
  route?: string;
  category?: string;
  title?: string;
  event?: string;
};

const CUSTOMER_BY_ENTITY: Record<string, string> = {
  ORDER: ROUTES.CUSTOMER.ORDERS,
  PURCHASE_ORDER: ROUTES.CUSTOMER.ORDERS,
  PROCUREMENT: ROUTES.CUSTOMER.ORDERS,
  PURCHASE_REQUEST: ROUTES.CUSTOMER.ORDERS,
  PAYMENT: ROUTES.CUSTOMER.PAYMENT_REMINDER,
  CREDIT: ROUTES.CUSTOMER.PAYMENT_REMINDER,
  SHIPMENT: ROUTES.CUSTOMER.SHIPMENT_TRACKING,
};

const SELLER_BY_ENTITY: Record<string, string> = {
  ORDER: ROUTES.SELLER.ORDERS,
  PURCHASE_ORDER: ROUTES.SELLER.ORDERS,
  PROCUREMENT: ROUTES.SELLER.ORDERS,
  PAYMENT: ROUTES.SELLER.PAYMENTS,
  SETTLEMENT: ROUTES.SELLER.PAYMENTS,
  SHIPMENT: ROUTES.SELLER.DISPATCH,
};

const safeInternalRoute = (
  value: string | undefined,
  audience: PushAudience,
): string | null => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://')) {
    return null;
  }
  const prefix = audience === 'seller' ? '/(seller)/' : '/(customer)/';
  return value.startsWith(prefix) ? value : null;
};

const inferFromTitle = (title: string): string | null => {
  const normalized = title.toLowerCase();
  if (normalized.includes('dispatch') || normalized.includes('shipment') || normalized.includes('truck')) {
    return 'SHIPMENT';
  }
  if (normalized.includes('payment') || normalized.includes('utr')) {
    return 'PAYMENT';
  }
  if (normalized.includes('request')) {
    return 'PURCHASE_REQUEST';
  }
  if (normalized.includes('order')) {
    return 'ORDER';
  }
  return null;
};

/** Screen opened when the user taps a push. Matches the in-app inbox destinations. */
export const routeForPushData = (
  data: PushNotificationData,
  audience: PushAudience,
): string => {
  const explicit = safeInternalRoute(data.route, audience);
  if (explicit) return explicit;

  const entityType = (data.entityType || inferFromTitle(data.title ?? '') || '').toUpperCase();
  const entityId = data.entityId?.trim() || null;
  const importTarget = importNotificationTarget(audience, entityType, entityId, null);
  if (importTarget) return importTarget.route;

  if (entityType === 'NEW_GRADE_REQUEST' && entityId) {
    const template =
      audience === 'seller'
        ? ROUTES.SELLER.GRADE_REQUEST_DETAILS
        : ROUTES.CUSTOMER.GRADE_REQUEST_DETAILS;
    return template.replace('[id]', encodeURIComponent(entityId));
  }

  if (audience === 'seller' && entityType === 'PURCHASE_REQUEST' && entityId) {
    return `${ROUTES.SELLER.PURCHASE_REQUEST_DETAIL}?id=${encodeURIComponent(entityId)}`;
  }

  const table = audience === 'seller' ? SELLER_BY_ENTITY : CUSTOMER_BY_ENTITY;
  return (
    table[entityType] ??
    (audience === 'seller' ? ROUTES.SELLER.NOTIFICATIONS : ROUTES.CUSTOMER.NOTIFICATIONS)
  );
};

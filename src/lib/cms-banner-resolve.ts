import { ROUTES } from '@/navigation/routes';

export type BannerRouteTarget =
  | { type: 'route'; href: string | { pathname: string; params?: Record<string, string> } }
  | { type: 'url'; url: string }
  | null;

/**
 * Resolve CMS banner CTA → app navigation (pure; no React Native imports).
 * B-02: OPEN_PURCHASE_REQUEST must never open Market / Grades catalogue.
 */
export function resolveCustomerBannerAction(options: {
  action?: string | null;
  targetId?: string | null;
  targetRoute?: string | null;
  externalUrl?: string | null;
}): BannerRouteTarget {
  const action = options.action || 'NO_ACTION';
  const targetId = options.targetId?.trim();
  const targetRoute = options.targetRoute?.trim();
  const externalUrl = options.externalUrl?.trim();

  if (action === 'OPEN_EXTERNAL_URL' && externalUrl) {
    return { type: 'url', url: externalUrl };
  }
  if (action === 'OPEN_MARKETPLACE' || action === 'OPEN_OFFER') {
    return { type: 'route', href: ROUTES.CUSTOMER.MARKET };
  }
  if (action === 'OPEN_PURCHASE_REQUEST') {
    if (targetId) {
      return {
        type: 'route',
        href: {
          pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
          params: { id: targetId, rfq: '1' },
        },
      };
    }
    return { type: 'route', href: ROUTES.CUSTOMER.PURCHASE_REQUEST_CREATE };
  }
  if (action === 'OPEN_ORDERS') {
    return { type: 'route', href: ROUTES.CUSTOMER.ORDERS };
  }
  if (action === 'OPEN_PRODUCT' && targetId) {
    return {
      type: 'route',
      href: {
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: targetId },
      },
    };
  }

  if (targetRoute) {
    if (/^https?:\/\//i.test(targetRoute)) {
      return { type: 'url', url: targetRoute };
    }
    if (targetRoute.includes('product')) {
      const id = targetId || targetRoute.split('/').filter(Boolean).pop();
      if (id) {
        return {
          type: 'route',
          href: {
            pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
            params: { id },
          },
        };
      }
    }
    if (targetRoute.includes('purchase-request') || targetRoute.includes('checkout')) {
      return { type: 'route', href: ROUTES.CUSTOMER.PURCHASE_REQUEST_CREATE };
    }
    if (targetRoute.includes('order')) {
      return { type: 'route', href: ROUTES.CUSTOMER.ORDERS };
    }
    if (targetRoute.includes('cart')) {
      return { type: 'route', href: ROUTES.CUSTOMER.CART };
    }
    return { type: 'route', href: ROUTES.CUSTOMER.MARKET };
  }

  if (externalUrl) {
    return { type: 'url', url: externalUrl };
  }

  return null;
}

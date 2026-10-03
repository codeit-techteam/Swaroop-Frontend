import { Linking } from 'react-native';

import { type Href, type useRouter } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import type { HomeBanner } from '@/types/home';

type Router = ReturnType<typeof useRouter>;

function resolveAction(options: {
  action?: string | null;
  targetId?: string | null;
  targetRoute?: string | null;
  externalUrl?: string | null;
}): { type: 'route'; href: Href } | { type: 'url'; url: string } | null {
  const action = options.action || 'NO_ACTION';
  const targetId = options.targetId?.trim();
  const targetRoute = options.targetRoute?.trim();
  const externalUrl = options.externalUrl?.trim();

  if (action === 'OPEN_EXTERNAL_URL' && externalUrl) {
    return { type: 'url', url: externalUrl };
  }
  if (
    action === 'OPEN_MARKETPLACE' ||
    action === 'OPEN_PURCHASE_REQUEST' ||
    action === 'OPEN_OFFER'
  ) {
    return { type: 'route', href: ROUTES.CUSTOMER.MARKET as Href };
  }
  if (action === 'OPEN_ORDERS') {
    return { type: 'route', href: ROUTES.CUSTOMER.ORDERS as Href };
  }
  if (action === 'OPEN_PRODUCT' && targetId) {
    return {
      type: 'route',
      href: {
        pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
        params: { id: targetId },
      } as unknown as Href,
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
          } as unknown as Href,
        };
      }
    }
    if (targetRoute.includes('order')) {
      return { type: 'route', href: ROUTES.CUSTOMER.ORDERS as Href };
    }
    return { type: 'route', href: ROUTES.CUSTOMER.MARKET as Href };
  }

  if (externalUrl) {
    return { type: 'url', url: externalUrl };
  }

  return null;
}

function applyNav(
  router: Router,
  target: { type: 'route'; href: Href } | { type: 'url'; url: string } | null,
): boolean {
  if (!target) return false;
  if (target.type === 'url') {
    void Linking.openURL(target.url);
    return true;
  }
  router.push(target.href);
  return true;
}

export function openCustomerBanner(router: Router, banner: HomeBanner): boolean {
  return applyNav(
    router,
    resolveAction({
      action: banner.ctaAction,
      targetId: banner.targetId,
      targetRoute: banner.targetRoute,
      externalUrl: banner.externalUrl,
    }),
  );
}

export function openCustomerBannerSecondary(router: Router, banner: HomeBanner): boolean {
  return applyNav(
    router,
    resolveAction({
      action: banner.secondaryCtaAction,
      targetId: banner.secondaryTargetId,
      externalUrl: banner.secondaryExternalUrl,
    }),
  );
}

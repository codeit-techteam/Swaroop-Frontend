import { Linking } from 'react-native';

import { type Href, type Router } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import type { HomeBanner } from '@/types/home';

export function openCustomerBanner(
  router: Router,
  banner: HomeBanner,
): boolean {
  const action = banner.ctaAction || 'NO_ACTION';
  const targetId = banner.targetId?.trim();
  const targetRoute = banner.targetRoute?.trim();
  const externalUrl = banner.externalUrl?.trim();

  if (action === 'OPEN_EXTERNAL_URL' && externalUrl) {
    void Linking.openURL(externalUrl);
    return true;
  }
  if (action === 'OPEN_MARKETPLACE') {
    router.push(ROUTES.CUSTOMER.MARKET as Href);
    return true;
  }
  if (action === 'OPEN_ORDERS') {
    router.push(ROUTES.CUSTOMER.ORDERS as Href);
    return true;
  }
  if (action === 'OPEN_PRODUCT' && targetId) {
    router.push({
      pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
      params: { id: targetId },
    } as unknown as Href);
    return true;
  }
  if (action === 'OPEN_OFFER') {
    router.push(ROUTES.CUSTOMER.MARKET as Href);
    return true;
  }

  if (targetRoute) {
    if (/^https?:\/\//i.test(targetRoute)) {
      void Linking.openURL(targetRoute);
      return true;
    }
    if (targetRoute.includes('product')) {
      const id = targetId || targetRoute.split('/').filter(Boolean).pop();
      if (id) {
        router.push({
          pathname: ROUTES.CUSTOMER.PRODUCT_DETAILS,
          params: { id },
        } as unknown as Href);
        return true;
      }
    }
    if (targetRoute.includes('order')) {
      router.push(ROUTES.CUSTOMER.ORDERS as Href);
      return true;
    }
    router.push(ROUTES.CUSTOMER.MARKET as Href);
    return true;
  }

  if (externalUrl) {
    void Linking.openURL(externalUrl);
    return true;
  }

  return false;
}

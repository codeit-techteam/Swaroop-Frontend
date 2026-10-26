import { type Href, useRouter } from 'expo-router';

import { ROUTES } from '@/navigation/routes';

export type SellerBottomNavTarget = 'dashboard' | 'orders' | 'products' | 'payouts' | 'profile';

export function navigateSellerBottomTab(
  router: ReturnType<typeof useRouter>,
  target: SellerBottomNavTarget,
): void {
  const routeMap: Record<SellerBottomNavTarget, string> = {
    dashboard: ROUTES.SELLER.DASHBOARD,
    orders: ROUTES.SELLER.ORDERS,
    // Products tab opens My Offers (live bulk pricing) — catalog stays at PRODUCTS via dashboard/profile.
    products: ROUTES.SELLER.OFFERS,
    payouts: ROUTES.SELLER.SETTLEMENTS,
    profile: ROUTES.SELLER.PROFILE,
  };

  router.replace(routeMap[target] as Href);
}

import { Linking } from 'react-native';

import { type Href, type useRouter } from 'expo-router';

import {
  resolveCustomerBannerAction,
  type BannerRouteTarget,
} from '@/lib/cms-banner-resolve';
import type { HomeBanner } from '@/types/home';

type Router = ReturnType<typeof useRouter>;

export { resolveCustomerBannerAction } from '@/lib/cms-banner-resolve';

function applyNav(router: Router, target: BannerRouteTarget): boolean {
  if (!target) return false;
  if (target.type === 'url') {
    void Linking.openURL(target.url);
    return true;
  }
  router.push(target.href as Href);
  return true;
}

export function openCustomerBanner(router: Router, banner: HomeBanner): boolean {
  return applyNav(
    router,
    resolveCustomerBannerAction({
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
    resolveCustomerBannerAction({
      action: banner.secondaryCtaAction,
      targetId: banner.secondaryTargetId,
      externalUrl: banner.secondaryExternalUrl,
    }),
  );
}

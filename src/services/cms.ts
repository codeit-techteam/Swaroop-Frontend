import { images } from '../../assets';
import { apiClient } from '@/api/client';
import type { HomeBanner, HomeBannerLayoutVariant } from '@/types/home';

type Envelope<T> = {
  success: boolean;
  data: T;
};

type CmsBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  targetRoute?: string | null;
  mediaKey?: string | null;
  mediaUrl?: string | null;
  mobileMediaUrl?: string | null;
  placement?: string;
  ctaText?: string | null;
  ctaAction?: string | null;
  badge?: string | null;
  description?: string | null;
  externalUrl?: string | null;
  targetId?: string | null;
  layoutVariant?: HomeBannerLayoutVariant | null;
  secondaryCtaText?: string | null;
  secondaryCtaAction?: string | null;
  secondaryExternalUrl?: string | null;
  secondaryTargetId?: string | null;
};

function normalizeCopy(value?: string | null): string {
  return (value ?? '').trim();
}

function distinctBody(subtitle: string, description: string): string {
  if (!description) return '';
  if (!subtitle) return description;
  // Avoid stacking nearly identical subtitle + description lines on mobile.
  if (description.toLowerCase() === subtitle.toLowerCase()) return '';
  if (description.toLowerCase().startsWith(subtitle.toLowerCase().slice(0, 24))) {
    return description;
  }
  return description;
}

export function mapCmsBanner(row: CmsBanner): HomeBanner {
  // Prefer mobile creative when Admin uploaded a separate mobile banner.
  const imageUrl = row.mobileMediaUrl || row.mediaUrl || row.mediaKey || '';
  const subtitle = normalizeCopy(row.subtitle);
  const description = distinctBody(subtitle, normalizeCopy(row.description));
  const hasMedia = Boolean(imageUrl.trim());
  const layoutVariant: HomeBannerLayoutVariant =
    row.layoutVariant === 'NAVY_GRID' || row.layoutVariant === 'IMAGE_OVERLAY'
      ? row.layoutVariant
      : hasMedia
        ? 'IMAGE_OVERLAY'
        : 'NAVY_GRID';

  return {
    id: row.id,
    badge:
      normalizeCopy(row.badge) ||
      (row.placement === 'HOME_HERO' ? 'Blind B2B Marketplace' : 'Update'),
    title: row.title,
    subtitle,
    description,
    buttonLabel: normalizeCopy(row.ctaText) || (row.targetRoute ? 'Open' : 'View'),
    imageUrl,
    // Text-only CMS navy heroes still get the bundled industrial photo underneath.
    imageSource: hasMedia ? undefined : images.homeHeroBanner,
    targetRoute: row.targetRoute,
    ctaAction: row.ctaAction,
    externalUrl: row.externalUrl,
    targetId: row.targetId,
    layoutVariant,
    secondaryButtonLabel: normalizeCopy(row.secondaryCtaText) || null,
    secondaryCtaAction: row.secondaryCtaAction,
    secondaryExternalUrl: row.secondaryExternalUrl,
    secondaryTargetId: row.secondaryTargetId,
  };
}

export async function fetchCustomerBanners(
  placement: 'HOME_HERO' | 'MARKETPLACE' | 'OFFERS' | 'DASHBOARD' | 'LOGIN' | 'OTHER' = 'HOME_HERO',
): Promise<HomeBanner[]> {
  const { ensureDevBackendSession } = await import('@/services/backend-session');
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<CmsBanner[]>>(
    `/customer/cms/banners?placement=${placement}&platform=CUSTOMER_APP&limit=20`,
  );
  return (payload.data.data ?? []).map(mapCmsBanner);
}

/** Home hero banners from Admin CMS (R2/DB). Empty CMS = no carousel (no Unsplash mask). */
export async function fetchCustomerHomeBanners(): Promise<HomeBanner[]> {
  try {
    return await fetchCustomerBanners('HOME_HERO');
  } catch {
    return [];
  }
}

export async function fetchCustomerMarketplaceBanners(): Promise<HomeBanner[]> {
  try {
    return await fetchCustomerBanners('MARKETPLACE');
  } catch {
    return [];
  }
}

export function trackCmsBannerEvent(id: string, event: 'IMPRESSION' | 'CLICK'): void {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  void apiClient
    .post(`/customer/cms/banners/${id}/events`, { event })
    .catch(() => undefined);
}

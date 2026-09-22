import { apiClient } from '@/api/client';
import { HOME_BANNERS } from '@/constants/homeBanners';
import type { HomeBanner } from '@/types/home';

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
  placement?: string;
  ctaText?: string | null;
  ctaAction?: string | null;
  badge?: string | null;
  description?: string | null;
  externalUrl?: string | null;
  targetId?: string | null;
};

export function mapCmsBanner(row: CmsBanner): HomeBanner {
  return {
    id: row.id,
    badge: row.badge || (row.placement === 'HOME_HERO' ? 'CAMPAIGN' : 'UPDATE'),
    title: row.title,
    subtitle: row.subtitle ?? '',
    description: row.description ?? row.subtitle ?? row.title,
    buttonLabel: row.ctaText || (row.targetRoute ? 'Open' : 'View'),
    imageUrl: row.mediaUrl || row.mediaKey || '',
    targetRoute: row.targetRoute,
    ctaAction: row.ctaAction,
    externalUrl: row.externalUrl,
    targetId: row.targetId,
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

export async function fetchCustomerHomeBanners(): Promise<HomeBanner[]> {
  try {
    const items = await fetchCustomerBanners('HOME_HERO');
    return items.length ? items : HOME_BANNERS;
  } catch {
    return HOME_BANNERS;
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

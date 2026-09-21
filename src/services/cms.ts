import { apiClient } from '@/api/client';
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
  placement?: string;
};

export function mapCmsBanner(row: CmsBanner): HomeBanner {
  return {
    id: row.id,
    badge: row.placement === 'HOME_HERO' ? 'CAMPAIGN' : 'UPDATE',
    title: row.title,
    subtitle: row.subtitle ?? '',
    description: row.subtitle ?? row.title,
    buttonLabel: row.targetRoute ? 'Open' : 'View',
    imageUrl: row.mediaKey ?? '',
  };
}

export async function fetchCustomerHomeBanners(): Promise<HomeBanner[]> {
  const { ensureDevBackendSession } = await import('@/services/backend-session');
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<CmsBanner[]>>(
    '/customer/cms/banners?placement=HOME_HERO&limit=20',
  );
  return (payload.data.data ?? []).map(mapCmsBanner);
}

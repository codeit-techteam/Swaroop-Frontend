import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success: boolean;
  data: T;
  meta?: { totalPages?: number; total?: number; page?: number; limit?: number };
};

export type PriceAlertEvaluation = {
  supported: boolean;
  reason: string;
};

export type PriceAlert = {
  id: string;
  gradeId: string;
  productId: string | null;
  targetPrice: string;
  currency: string;
  unit: 'MT' | 'KG' | string;
  direction: 'BELOW' | 'ABOVE' | string;
  enabled: boolean;
  lastTriggeredAt: string | null;
  lastTriggeredPrice: string | null;
  evaluation: PriceAlertEvaluation;
  grade?: { id: string; code: string; name: string };
  product?: { id: string; code: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePriceAlertInput = {
  gradeId: string;
  productId?: string;
  targetPrice: string;
  currency?: string;
  unit?: 'MT' | 'KG';
  direction?: 'BELOW' | 'ABOVE';
  enabled?: boolean;
};

export type UpdatePriceAlertInput = {
  targetPrice?: string;
  currency?: string;
  unit?: 'MT' | 'KG';
  direction?: 'BELOW' | 'ABOVE';
  enabled?: boolean;
  note?: string;
};

export async function fetchPriceAlerts(params?: {
  gradeId?: string;
  enabled?: boolean;
}): Promise<PriceAlert[]> {
  await ensureDevBackendSession('customer');
  const pages: PriceAlert[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const payload = await apiClient.get<Envelope<PriceAlert[]>>('/customer/price-alerts', {
      params: {
        page,
        limit: 50,
        ...(params?.gradeId ? { gradeId: params.gradeId } : {}),
        ...(params?.enabled !== undefined ? { enabled: params.enabled ? 'true' : 'false' } : {}),
      },
    });
    pages.push(...(payload.data.data ?? []));
    totalPages = payload.data.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  return pages;
}

export async function createPriceAlert(input: CreatePriceAlertInput): Promise<PriceAlert> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<PriceAlert>>('/customer/price-alerts', input);
  return payload.data.data;
}

export async function updatePriceAlert(
  id: string,
  input: UpdatePriceAlertInput,
): Promise<PriceAlert> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.patch<Envelope<PriceAlert>>(
    `/customer/price-alerts/${id}`,
    input,
  );
  return payload.data.data;
}

export async function deletePriceAlert(id: string): Promise<void> {
  await ensureDevBackendSession('customer');
  await apiClient.delete(`/customer/price-alerts/${id}`);
}

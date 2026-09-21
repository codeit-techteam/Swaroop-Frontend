import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';
import type {
  BulkLogisticsQuoteRequest,
  CreateBulkLogisticsQuoteInput,
} from '@/types/bulk-logistics-quote';

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function submitBulkLogisticsQuote(
  input: CreateBulkLogisticsQuoteInput,
): Promise<BulkLogisticsQuoteRequest> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.post<Envelope<BulkLogisticsQuoteRequest>>(
    '/customer/bulk-logistics-quotes',
    input,
  );
  return payload.data.data;
}

export function bulkLogisticsQuoteErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || error.message || 'Unable to submit request.';
  }
  if (error instanceof Error) return error.message;
  return 'Unable to submit request.';
}

import { Linking } from 'react-native';

import { apiClient } from '@/api/client';
import { ensureDevBackendSession } from '@/services/backend-session';

type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type InvoiceDownloadResult = {
  available: boolean;
  url: string | null;
  message?: string | null;
  piNumber?: string;
  status?: string;
  documentId?: string | null;
};

/**
 * Authorized proforma/invoice PDF download. Never fabricates PDF content —
 * when the vault has no artifact, returns available:false with a message.
 */
export async function fetchProformaInvoiceDownload(
  id: string,
): Promise<InvoiceDownloadResult> {
  await ensureDevBackendSession('customer');
  const payload = await apiClient.get<Envelope<InvoiceDownloadResult>>(
    `/customer/proforma-invoices/${id}/download`,
  );
  const data = payload.data.data;
  return {
    available: Boolean(data?.available && data?.url),
    url: data?.url ?? null,
    message:
      data?.message ??
      (data?.available
        ? null
        : 'Invoice PDF is not available for download yet.'),
    piNumber: data?.piNumber,
    status: data?.status,
    documentId: data?.documentId,
  };
}

export async function openProformaInvoiceDownload(id: string): Promise<InvoiceDownloadResult> {
  const result = await fetchProformaInvoiceDownload(id);
  if (result.available && result.url) {
    await Linking.openURL(result.url);
  }
  return result;
}

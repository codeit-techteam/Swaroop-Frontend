import { openProformaInvoiceDownload } from '@/services/invoice-download';
import { fetchCustomerOrderById } from '@/services/orders';

export type OrderDocumentDownloadResult = {
  available: boolean;
  message?: string | null;
};

/**
 * Order summary PDF — only opens a vaulted document when the backend exposes one.
 * Never fabricates PDF content.
 */
export const downloadOrderSummary = async (
  orderId: string,
): Promise<OrderDocumentDownloadResult> => {
  const order = await fetchCustomerOrderById(orderId);
  const proformaId =
    (order as { proformaInvoiceId?: string | null } | null)?.proformaInvoiceId ??
    (order as { proformaId?: string | null } | null)?.proformaId ??
    null;

  if (!proformaId) {
    return {
      available: false,
      message:
        'Order summary PDF has not been generated yet. The commercial record is available in Documents once issued.',
    };
  }

  const result = await openProformaInvoiceDownload(proformaId);
  return {
    available: result.available,
    message: result.message,
  };
};

export const downloadOrderInvoice = async (
  orderId: string,
): Promise<OrderDocumentDownloadResult> => {
  return downloadOrderSummary(orderId);
};

export const raiseSupportTicket = async (_orderId: string): Promise<void> => {
  await Promise.resolve();
};

import {
  buildDefaultDispatchDetail,
  DISPATCH_DETAIL_EXTENSIONS,
  type DispatchDetailExtension,
} from '@/seller/mock/dispatch';
import type { DispatchOrder } from '@/seller/modules/dispatch/types/dispatch';

export const getDispatchDetailExtension = (orderId: string): DispatchDetailExtension =>
  DISPATCH_DETAIL_EXTENSIONS[orderId] ?? buildDefaultDispatchDetail(orderId);

export const simulateDispatchDocumentDownload = async (documentName: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return `${documentName} prepared for download.`;
};

export const formatDispatchOrderId = (orderId: string): string =>
  orderId.replace('PT-', '#');

export const getDispatchStatusLabel = (order: DispatchOrder): string => {
  switch (order.stage) {
    case 'ready_to_dispatch':
    case 'invoice_generated':
      return 'Ready';
    case 'vehicle_assigned':
    case 'loading':
      return 'Loading';
    case 'dispatch_ready':
    case 'dispatched':
    case 'in_transit':
      return 'In Transit';
    case 'delayed':
      return 'Delayed';
    case 'delivered':
      return 'Delivered';
    default:
      return 'Pending';
  }
};

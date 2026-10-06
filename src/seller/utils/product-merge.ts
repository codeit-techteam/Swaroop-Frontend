import type { SellerProduct } from '@/seller/types';

import { isBackendId } from './listing-input';

/**
 * Merges the backend product list into the device list.
 *
 * Backend rows (UUID ids) are authoritative: they replace their local copies, and backend-id rows
 * missing from the response are dropped. Device-only items (non-UUID ids, never saved to the
 * backend) are kept; any that claim to be published are shown as drafts because buyers cannot see
 * them.
 */
export const mergeApiProductsWithDeviceDrafts = (
  local: SellerProduct[],
  api: SellerProduct[],
): SellerProduct[] => {
  const apiIds = new Set(api.map((product) => product.id));
  const deviceOnly = local
    .filter((product) => !isBackendId(product.id) && !apiIds.has(product.id))
    .map((product) =>
      product.status === 'published' ? { ...product, status: 'draft' as const } : product,
    );
  return [...api, ...deviceOnly];
};

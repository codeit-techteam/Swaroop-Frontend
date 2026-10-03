import { useMemo } from 'react';

import { Notice } from '@/features/import/components';
import type { ImportMode } from '@/features/import/config';
import { readSellerAccess } from '@/services/seller-auth';

export const IMPORT_MANAGE_PERMISSION = 'import.manage';

/**
 * Seller owners (and customers) can always trade; a Seller Manager needs the
 * `import.manage` grant. The backend enforces the same rule, this only hides
 * actions that would be rejected.
 */
export function canManageImport(mode: ImportMode): boolean {
  if (mode !== 'seller') return true;
  const access = readSellerAccess();
  if (!access || access.role !== 'SELLER_MANAGER') return true;
  return (access.permissions ?? []).includes(IMPORT_MANAGE_PERMISSION);
}

export function useCanManageImport(mode: ImportMode): boolean {
  return useMemo(() => canManageImport(mode), [mode]);
}

export function ViewOnlyNotice() {
  return (
    <Notice tone="neutral">
      View-only access. You can follow import listings, negotiations, deals and shipments, but
      changes need the import management permission from your seller account owner.
    </Notice>
  );
}

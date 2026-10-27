export { formatSellerBusinessAddressLabel } from '@/utils/seller-address-label';

/** Compact warehouse/operating label — never "City · City" (S-09). */
export function formatSellerOperatingLocationLabel(
  location:
    | {
        city?: string | null;
        name?: string | null;
        warehouse?: string | null;
        state?: string | null;
      }
    | null
    | undefined,
): string | null {
  if (!location) return null;
  const parts: string[] = [];
  const pushUnique = (value?: string | null) => {
    const next = String(value ?? '').trim();
    if (!next) return;
    const normalized = next.toLowerCase();
    if (parts.some((part) => part.toLowerCase() === normalized)) return;
    parts.push(next);
  };
  pushUnique(location.city);
  const warehouse = location.warehouse || location.name;
  if (warehouse && warehouse.toLowerCase() !== String(location.city ?? '').trim().toLowerCase()) {
    pushUnique(warehouse);
  } else {
    pushUnique(location.state);
  }
  return parts.length ? parts.join(' · ') : null;
}

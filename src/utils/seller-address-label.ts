/** Minimal address shape used for seller dashboard / profile labels (S-09). */
export type SellerAddressParts = {
  line1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
};

/**
 * Compact business-address label.
 * Prefers registered profile address parts — never device/GPS location.
 * Dedupes repeated city/state tokens so we never show "Kolkata · Kolkata".
 */
export function formatSellerBusinessAddressLabel(
  address: SellerAddressParts | null | undefined,
  registeredAddress?: string | null,
): string | null {
  if (!address) {
    const registered = registeredAddress?.trim();
    return registered || null;
  }

  const parts: string[] = [];
  const pushUnique = (value?: string | null) => {
    const next = String(value ?? '').trim();
    if (!next) return;
    const normalized = next.toLowerCase();
    if (parts.some((part) => part.toLowerCase() === normalized)) return;
    if (
      parts.some(
        (part) =>
          part.toLowerCase().includes(normalized) || normalized.includes(part.toLowerCase()),
      )
    ) {
      return;
    }
    parts.push(next);
  };

  pushUnique(address.city);
  pushUnique(address.state);
  pushUnique(address.postalCode);

  if (parts.length) return parts.join(', ');

  const line1 = address.line1?.trim();
  if (line1) return line1;

  const registered = registeredAddress?.trim();
  return registered || null;
}

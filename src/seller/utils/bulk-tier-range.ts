/** First bulk tier max: prefer MOQ when it is a real upper bound (>1), else 10 (S-05). */
export function defaultBulkTierMaxQty(moq: string | number | null | undefined): string {
  const n = Number(moq);
  if (Number.isFinite(n) && n > 1) return String(Math.trunc(n));
  return '10';
}

/**
 * Display label for a bulk pricing quantity band (S-05).
 * Open-ended / missing / non-positive max → "N+ MT" (never "N-0 MT").
 */
export function formatBulkTierRangeLabel(
  minQty: string | number | null | undefined,
  maxQty: string | number | null | undefined,
  unit = 'MT',
): string {
  const minN = Number(minQty);
  const minLabel = Number.isFinite(minN) && minN > 0 ? String(Math.trunc(minN)) : '1';
  const maxRaw = maxQty == null ? '' : String(maxQty).trim();
  const maxN = Number(maxRaw);
  if (!maxRaw || !Number.isFinite(maxN) || maxN <= 0 || maxN < Number(minLabel)) {
    return `${minLabel}+ ${unit}`;
  }
  return `${minLabel}-${Math.trunc(maxN)} ${unit}`;
}

/** Persist open-ended tiers as null — never send 0 as maxQty. */
export function normalizeBulkTierMaxQty(
  maxQty: string | number | null | undefined,
): number | null {
  if (maxQty === null || maxQty === undefined) return null;
  const raw = String(maxQty).trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

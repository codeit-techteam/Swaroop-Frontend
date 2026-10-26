/** Strip non-digits and leading zeros so typing "10" over a default "0" becomes "10", not "010". */
export function sanitizeIntegerInput(value: string): string {
  const digits = String(value).replace(/[^\d]/g, '');
  if (!digits) return '';
  return digits.replace(/^0+(?=\d)/, '');
}

/** Allow one decimal; strip leading zeros on the integer part (keep "0.5"). */
export function sanitizeDecimalInput(value: string): string {
  let cleaned = String(value).replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  if (!cleaned) return '';
  if (cleaned.startsWith('.')) return `0${cleaned}`;

  const [intPart, decPart] = cleaned.split('.');
  const intSanitized = intPart.replace(/^0+(?=\d)/, '') || (decPart !== undefined ? '0' : '');
  return decPart !== undefined ? `${intSanitized}.${decPart}` : intSanitized;
}

/** Prefer empty string over a catalog/API zero so fields stay clear until the seller types. */
export function positiveOrEmpty(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '';
  return String(n);
}

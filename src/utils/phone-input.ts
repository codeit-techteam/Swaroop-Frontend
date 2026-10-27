/** Digits only, max 10 — never accept letters or spaces in the mobile field. */
export function sanitizeIndianMobileInput(value: string): string {
  return String(value).replace(/\D/g, '').slice(0, 10);
}

/** Shown when GET OTP is tapped with an empty mobile field (L-06). */
export const EMPTY_MOBILE_MESSAGE = 'Please enter your mobile number';

/**
 * Phone field validation for login forms.
 * - Empty / incomplete (1–9 digits): never show while typing; only after submit.
 * - 10 digits but invalid start: format error as soon as length is complete.
 */
export function indianMobileFieldError(
  value: string,
  options?: { touched?: boolean; submitted?: boolean; editing?: boolean },
): string | undefined {
  const digits = sanitizeIndianMobileInput(value);
  const { submitted = false, editing = false } = options ?? {};

  if (!digits) {
    return submitted ? EMPTY_MOBILE_MESSAGE : undefined;
  }

  if (digits.length < 10) {
    // Incomplete while typing or after blur alone — stay quiet until Get OTP / submit.
    if (editing || !submitted) {
      return undefined;
    }
    return 'Enter the full 10-digit mobile number.';
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid 10-digit Indian mobile number';
  }

  return undefined;
}

export function isCompleteIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(sanitizeIndianMobileInput(value));
}

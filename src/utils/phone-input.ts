/** Digits only, max 10 — never accept letters or spaces in the mobile field. */
export function sanitizeIndianMobileInput(value: string): string {
  return String(value).replace(/\D/g, '').slice(0, 10);
}

/**
 * Phone field validation for login forms.
 * - Empty: no error while typing; submit path shows a clear required message.
 * - Incomplete (1–9 digits): soft hint only after blur / submit attempt.
 * - Invalid start digit or non-digit already stripped: full format error.
 */
export function indianMobileFieldError(
  value: string,
  options?: { touched?: boolean; submitted?: boolean },
): string | undefined {
  const digits = sanitizeIndianMobileInput(value);
  const { touched = false, submitted = false } = options ?? {};

  if (!digits) {
    if (submitted) return 'Enter your 10-digit mobile number.';
    return undefined;
  }

  if (digits.length < 10) {
    if (submitted || (touched && digits.length > 0)) {
      // Avoid the full "10-digit" error after a single keystroke unless submitted.
      if (!submitted && digits.length < 3) return undefined;
      return 'Enter the full 10-digit mobile number.';
    }
    return undefined;
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid 10-digit Indian mobile number';
  }

  return undefined;
}

export function isCompleteIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(sanitizeIndianMobileInput(value));
}

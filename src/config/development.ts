/**
 * Frontend-only development authentication flags.
 *
 * Enabled ONLY for Metro (`__DEV__`). Release/preview APKs must never enable
 * demo OTP even if someone accidentally sets EXPO_PUBLIC_APP_ENV=development —
 * production builds set EXPO_PUBLIC_APP_ENV=production explicitly.
 *
 * Demo credentials stay in this module for local Metro testing only; UI must
 * gate every hint behind `isDevAuthEnabled()` so strings are not shown in
 * production, and auth services must never fall back to password login against
 * a production API.
 */
export const DEVELOPMENT_MODE = __DEV__;

/** Shared demo identity for local Metro only. Never prefill in release builds. */
export const DEMO_PHONE = '8240890242';
export const DEMO_OTP = '123456';
export const DEMO_USER_NAME = 'Karan Veer';
export const DEMO_CUSTOMER_EMAIL = 'customer@test.local';
export const DEMO_SELLER_EMAIL = 'seller@test.local';
export const DEMO_PASSWORD = 'Test@12345';

export const DEV_AUTH = {
  phoneNumber: DEMO_PHONE,
  otp: DEMO_OTP,
  displayName: DEMO_USER_NAME,
  customerEmail: DEMO_CUSTOMER_EMAIL,
  sellerEmail: DEMO_SELLER_EMAIL,
  password: DEMO_PASSWORD,
  invalidOtpMessage: 'Invalid OTP',
} as const;

/**
 * One-shot storage reset for development.
 *
 * Bump this number to force a single full wipe of persisted session data on the
 * next launch. Set to 0 to disable.
 */
export const DEV_RESET_VERSION = 1;

export const DEV_FEATURES = {
  /** Soft client-side DEMO_OTP match helpers for Metro UI only — never grants a session without backend verify. */
  localOtpValidation: true,
  /** Persist login locally via AsyncStorage. */
  localStorageLogin: true,
  /** Allow local session when catalog backend is unreachable. */
  allowOfflineBackendFallback: true,
} as const;

export const isDevAuthEnabled = (): boolean => DEVELOPMENT_MODE;

export const isLocalOtpEnabled = (): boolean => DEVELOPMENT_MODE && DEV_FEATURES.localOtpValidation;

export const isLocalStorageLoginEnabled = (): boolean =>
  DEVELOPMENT_MODE && DEV_FEATURES.localStorageLogin;

export const isOfflineBackendFallbackEnabled = (): boolean =>
  DEVELOPMENT_MODE && DEV_FEATURES.allowOfflineBackendFallback;

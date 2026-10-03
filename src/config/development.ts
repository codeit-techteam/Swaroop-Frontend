/**
 * Frontend-only development authentication flags.
 * Tied to the Metro dev build so release APK/IPA builds never ship the demo
 * shortcuts below (local OTP, shared demo accounts, offline sessions).
 */
export const DEVELOPMENT_MODE = __DEV__;

/** Shared demo identity across Customer + Seller mobile panels. */
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
 * next launch (clears any stranded half-finished login so the flow restarts at
 * onboarding). It only fires once per value, so normal demo-account persistence
 * testing is unaffected on later reloads. Set to 0 to disable.
 */
export const DEV_RESET_VERSION = 1;

export const DEV_FEATURES = {
  /** Accept DEMO_OTP without SMS / API. */
  localOtpValidation: true,
  /** Persist login locally via AsyncStorage. KYC approval always comes from the backend. */
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

/**
 * Frontend-only development authentication flags.
 * Flip DEVELOPMENT_MODE to false when wiring a real backend later.
 */
export const DEVELOPMENT_MODE = true;

export const DEMO_PHONE = '8240890242';
export const DEMO_OTP = '123456';

export const DEV_AUTH = {
  phoneNumber: DEMO_PHONE,
  otp: DEMO_OTP,
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
  /** Simulate KYC verification completing after a delay in dev. */
  autoKycApproval: true,
  /** Persist login + KYC locally via AsyncStorage. */
  localStorageLogin: true,
  /** Dev-only wait before KYC is marked approved after submission. */
  kycVerificationDelayMs: 8000,
} as const;

export const isDevAuthEnabled = (): boolean => DEVELOPMENT_MODE;

export const isLocalOtpEnabled = (): boolean => DEVELOPMENT_MODE && DEV_FEATURES.localOtpValidation;

export const isAutoKycApprovalEnabled = (): boolean =>
  DEVELOPMENT_MODE && DEV_FEATURES.autoKycApproval;

export const getKycVerificationDelayMs = (): number =>
  isAutoKycApprovalEnabled() ? DEV_FEATURES.kycVerificationDelayMs : 0;

export const isLocalStorageLoginEnabled = (): boolean =>
  DEVELOPMENT_MODE && DEV_FEATURES.localStorageLogin;

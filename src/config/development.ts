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

export const DEV_FEATURES = {
  /** Accept DEMO_OTP without SMS / API. */
  localOtpValidation: true,
  /** Mark KYC approved immediately after application submission. */
  autoKycApproval: true,
  /** Persist login + KYC locally via AsyncStorage. */
  localStorageLogin: true,
} as const;

export const isDevAuthEnabled = (): boolean => DEVELOPMENT_MODE;

export const isLocalOtpEnabled = (): boolean => DEVELOPMENT_MODE && DEV_FEATURES.localOtpValidation;

export const isAutoKycApprovalEnabled = (): boolean =>
  DEVELOPMENT_MODE && DEV_FEATURES.autoKycApproval;

export const isLocalStorageLoginEnabled = (): boolean =>
  DEVELOPMENT_MODE && DEV_FEATURES.localStorageLogin;

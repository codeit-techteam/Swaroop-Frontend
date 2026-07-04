import {
  DEMO_OTP,
  DEMO_PHONE,
  DEV_AUTH,
  isAutoKycApprovalEnabled,
  isLocalOtpEnabled,
} from '@/config/development';

export const validateDevOtp = (otp: string): boolean => {
  if (!isLocalOtpEnabled()) {
    // Backend integration point — reject until real auth is wired.
    return false;
  }

  return otp === DEMO_OTP;
};

export const getInvalidOtpMessage = (): string => DEV_AUTH.invalidOtpMessage;

export const shouldAutoApproveKyc = (): boolean => isAutoKycApprovalEnabled();

export const isDevAccount = (mobileNumber: string): boolean => mobileNumber === DEMO_PHONE;

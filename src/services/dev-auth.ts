import { DEMO_OTP, DEMO_PHONE, DEV_AUTH, isLocalOtpEnabled } from '@/config/development';

export const validateDevOtp = (otp: string): boolean => {
  if (!isLocalOtpEnabled()) {
    // Backend integration point — reject until real auth is wired.
    return false;
  }

  return otp === DEMO_OTP;
};

export const getInvalidOtpMessage = (): string => DEV_AUTH.invalidOtpMessage;

export const isDevAccount = (mobileNumber: string): boolean => mobileNumber === DEMO_PHONE;

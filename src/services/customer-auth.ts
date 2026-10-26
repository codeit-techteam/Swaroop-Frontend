import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { DEVELOPMENT_MODE, isOfflineBackendFallbackEnabled } from '@/config/development';
import { persistTokens, unwrapAuthPayload } from '@/services/backend-session';
import { toE164IndianPhone } from '@/services/seller-auth';
import type { ApiRequestConfig } from '@/types/api';

export type CustomerOtpPurpose = 'LOGIN' | 'SIGNUP';
export type CustomerRoleHint = 'CUSTOMER' | 'SELLER';

type AuthErrorBody = { message?: string | string[]; code?: string };

const PUBLIC_AUTH_REQUEST = { skipAuth: true, skipRefresh: true } as ApiRequestConfig;

/** True when the API refused a resend because an OTP was issued moments ago. */
export function isOtpCooldownError(error: unknown): boolean {
  return (
    isAxiosError<AuthErrorBody>(error) &&
    error.response?.status === 429 &&
    error.response.data?.code === 'AUTH_OTP_RATE_LIMITED'
  );
}

export function customerAuthErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<AuthErrorBody>(error)) {
    if (!error.response) {
      return 'Unable to reach PetroTrade. Check your internet connection and try again.';
    }
    const message = error.response.data?.message;
    if (typeof message === 'string' && message) return message;
    if (Array.isArray(message) && message[0]) return message[0];
  }
  return fallback;
}

/**
 * Demo OTP shortcuts and password fallbacks were removed from release paths.
 * Production always requires a real provider-issued OTP from `/auth/otp/verify`.
 */
export function isDevDemoOtp(_mobile: string, _otp: string): boolean {
  return false;
}

export async function sendCustomerOtp(mobile: string, purpose: CustomerOtpPurpose): Promise<void> {
  await apiClient.post(
    '/auth/otp/send',
    { phone: toE164IndianPhone(mobile), purpose },
    PUBLIC_AUTH_REQUEST,
  );
}

/**
 * Verifies the OTP with the API and stores the issued access/refresh tokens.
 * No demo/password fallback — even in Metro, prefer the real OTP path so local
 * testing exercises the same contract as production.
 */
export async function verifyCustomerOtp(
  mobile: string,
  otp: string,
  purpose: CustomerOtpPurpose,
  roleHint: CustomerRoleHint = 'CUSTOMER',
): Promise<void> {
  const response = await apiClient.post(
    '/auth/otp/verify',
    { phone: toE164IndianPhone(mobile), otp, purpose, roleHint },
    PUBLIC_AUTH_REQUEST,
  );
  if (!persistTokens(unwrapAuthPayload(response.data))) {
    // Metro-only offline: keep a clear error rather than inventing a session.
    if (DEVELOPMENT_MODE && isOfflineBackendFallbackEnabled()) {
      throw new Error('Sign-in did not return a session. Please try again.');
    }
    throw new Error('Sign-in did not return a session. Please try again.');
  }
}

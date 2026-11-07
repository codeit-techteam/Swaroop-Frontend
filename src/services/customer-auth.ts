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
    const status = error.response?.status;
    if (!error.response) {
      return 'Unable to reach PolyStoreX. Check your internet connection and try again.';
    }
    // DigitalOcean rewrites an app 502 into an HTML 504 page. Never show that HTML.
    if (status === 502 || status === 503 || status === 504) {
      return 'OTP service is temporarily unavailable. Please try again in a moment.';
    }
    const message = error.response.data?.message;
    if (typeof message === 'string' && message && !message.trim().startsWith('<')) return message;
    if (Array.isArray(message) && message[0]) return message[0];
  }
  return fallback;
}

export type CustomerOtpSendResult = {
  message?: string;
  resendCooldownSeconds?: number;
  expiresInSeconds?: number;
  smsDispatched?: boolean;
  correlationId?: string;
};

function unwrapOtpSend(body: unknown): CustomerOtpSendResult {
  if (!body || typeof body !== 'object') return {};
  const root = body as Record<string, unknown>;
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;
  if (data.smsDispatched === false && !__DEV__) {
    throw new Error(
      'SMS could not be dispatched. Please try again in a moment.',
    );
  }
  return {
    message: typeof data.message === 'string' ? data.message : undefined,
    resendCooldownSeconds:
      typeof data.resendCooldownSeconds === 'number'
        ? data.resendCooldownSeconds
        : undefined,
    expiresInSeconds:
      typeof data.expiresInSeconds === 'number' ? data.expiresInSeconds : undefined,
    smsDispatched:
      typeof data.smsDispatched === 'boolean' ? data.smsDispatched : undefined,
    correlationId:
      typeof data.correlationId === 'string' ? data.correlationId : undefined,
  };
}

export async function sendCustomerOtp(
  mobile: string,
  purpose: CustomerOtpPurpose,
): Promise<CustomerOtpSendResult> {
  const response = await apiClient.post(
    '/auth/otp/send',
    { phone: toE164IndianPhone(mobile), purpose },
    PUBLIC_AUTH_REQUEST,
  );
  return unwrapOtpSend(response.data);
}

/** Fresh OTP — invalidates the previous challenge server-side. */
export async function resendCustomerOtp(
  mobile: string,
  purpose: CustomerOtpPurpose,
): Promise<CustomerOtpSendResult> {
  const response = await apiClient.post(
    '/auth/otp/resend',
    { phone: toE164IndianPhone(mobile), purpose },
    PUBLIC_AUTH_REQUEST,
  );
  return unwrapOtpSend(response.data);
}

/** Verifies the OTP with the API and stores the issued access/refresh tokens. */
export async function verifyCustomerOtp(
  mobile: string,
  otp: string,
  purpose: CustomerOtpPurpose,
  roleHint: CustomerRoleHint = 'CUSTOMER',
): Promise<void> {
  const phone = toE164IndianPhone(mobile);
  const response = await apiClient.post(
    '/auth/otp/verify',
    { phone, otp, purpose, roleHint },
    PUBLIC_AUTH_REQUEST,
  );
  if (!persistTokens(unwrapAuthPayload(response.data))) {
    if (DEVELOPMENT_MODE && isOfflineBackendFallbackEnabled()) {
      throw new Error('Sign-in did not return a session. Please try again.');
    }
    throw new Error('Sign-in did not return a session. Please try again.');
  }
}

import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { STORAGE_KEYS } from '@/constants';
import { clearCachedSellerAccount } from '@/services/seller-profile';
import { useAuthStore } from '@/store/auth-store';
import type { ApiRequestConfig } from '@/types/api';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

type Envelope<T> = {
  success?: boolean;
  data?: T;
};

export type SellerAuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  roles?: string[];
  loginId?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  permissions?: string[];
  mustChangePassword?: boolean;
};

export type SellerAccess = {
  role: string;
  sellerId?: string | null;
  sellerName?: string | null;
  permissions: string[];
  loginId?: string | null;
  name?: string;
};

export type SellerAuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: SellerAuthUser;
};

export function toE164IndianPhone(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (mobile.trim().startsWith('+')) return mobile.trim();
  return `+91${digits}`;
}

export function sellerAuthErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const payload = error.response?.data;
    const message = payload?.message;
    if (typeof message === 'string' && message) return message;
    if (Array.isArray(message) && message[0]) return message[0];
    if (!error.response) {
      return 'Unable to reach PolyStoreX. Check your internet connection and try again.';
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function unwrapSession(body: unknown): SellerAuthSession {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid auth response');
  }
  const root = body as Envelope<SellerAuthSession> & SellerAuthSession;
  const nested = root.data ?? root;
  if (!nested.accessToken) {
    throw new Error('Auth response missing access token');
  }
  return {
    accessToken: nested.accessToken,
    refreshToken: nested.refreshToken,
    expiresIn: nested.expiresIn,
    user: nested.user,
  };
}

export function persistSellerAuthSession(session: SellerAuthSession): void {
  clearCachedSellerAccount();
  setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
  if (session.refreshToken) {
    setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
  }
  saveSellerAccess(session.user);
  useAuthStore.getState().setTokens(session.accessToken, session.refreshToken ?? '');
}

export function saveSellerAccess(user?: SellerAuthUser) {
  if (!user) return;
  const access: SellerAccess = {
    role: user.roles?.includes('SELLER_MANAGER') ? 'SELLER_MANAGER' : 'SELLER',
    sellerId: user.sellerId,
    sellerName: user.sellerName,
    permissions: user.permissions ?? [],
    loginId: user.loginId,
    name: user.displayName || [user.firstName, user.lastName].filter(Boolean).join(' '),
  };
  setStorageItem(STORAGE_KEYS.SELLER_ACCESS, JSON.stringify(access));
}

export function readSellerAccess(): SellerAccess | null {
  const raw = getStorageItem(STORAGE_KEYS.SELLER_ACCESS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SellerAccess;
  } catch {
    return null;
  }
}

export function clearSellerAccess() {
  removeStorageItem(STORAGE_KEYS.SELLER_ACCESS);
  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export type SellerOtpPurpose = 'LOGIN' | 'SIGNUP';

export type SellerSignupProfile = {
  fullName?: string;
  companyName?: string;
  gstNumber?: string;
};

export type SellerOtpSendResult = {
  sent: true;
  demoOtp?: string;
  resendCooldownSeconds?: number;
  expiresInSeconds?: number;
};

function unwrapSellerOtpSend(body: unknown): SellerOtpSendResult {
  type OtpSendPayload = {
    devOtp?: string;
    resendCooldownSeconds?: number;
    expiresInSeconds?: number;
    smsDispatched?: boolean;
  };
  const envelope = body as Envelope<OtpSendPayload>;
  const data: OtpSendPayload =
    (envelope?.data && typeof envelope.data === 'object' ? envelope.data : null) ??
    (body && typeof body === 'object' ? (body as OtpSendPayload) : {});
  const exposed = typeof data.devOtp === 'string' ? data.devOtp : undefined;
  if (data.smsDispatched === false && !__DEV__) {
    throw new Error(
      'SMS could not be dispatched. Please try again in a moment.',
    );
  }

  return {
    sent: true,
    // Only surface server-exposed dev OTP (non-production backend). Never invent 123456.
    ...(exposed ? { demoOtp: exposed } : {}),
    ...(typeof data.resendCooldownSeconds === 'number'
      ? { resendCooldownSeconds: data.resendCooldownSeconds }
      : {}),
    ...(typeof data.expiresInSeconds === 'number'
      ? { expiresInSeconds: data.expiresInSeconds }
      : {}),
  };
}

export async function sendSellerOtp(
  mobile: string,
  purpose: SellerOtpPurpose = 'LOGIN',
): Promise<SellerOtpSendResult> {
  const phone = toE164IndianPhone(mobile);
  const response = await apiClient.post('/auth/otp/send', { phone, purpose }, {
    skipAuth: true,
    skipRefresh: true,
  } as ApiRequestConfig);
  return unwrapSellerOtpSend(response.data);
}

export async function resendSellerOtp(
  mobile: string,
  purpose: SellerOtpPurpose = 'LOGIN',
): Promise<SellerOtpSendResult> {
  const phone = toE164IndianPhone(mobile);
  const response = await apiClient.post(
    '/auth/otp/resend',
    { phone, purpose },
    { skipAuth: true, skipRefresh: true } as ApiRequestConfig,
  );
  return unwrapSellerOtpSend(response.data);
}

export async function verifySellerOtpSession(
  mobile: string,
  otp: string,
  purpose: SellerOtpPurpose = 'LOGIN',
  signup?: SellerSignupProfile,
): Promise<SellerAuthSession> {
  const phone = toE164IndianPhone(mobile);
  const response = await apiClient.post(
    '/auth/otp/verify',
    {
      phone,
      otp,
      purpose,
      roleHint: 'SELLER',
      ...(signup?.fullName ? { firstName: signup.fullName.trim() } : {}),
      ...(signup?.companyName ? { companyName: signup.companyName.trim() } : {}),
      ...(signup?.gstNumber ? { gstin: signup.gstNumber.trim().toUpperCase() } : {}),
    },
    { skipAuth: true, skipRefresh: true } as ApiRequestConfig,
  );
  return unwrapSession(response.data);
}

/** Full seller login/signup used by OTP screen — verifies via `/auth/otp/verify` only. */
export async function authenticateSellerFromOtp(
  mobile: string,
  otp: string,
  purpose: SellerOtpPurpose = 'LOGIN',
  signup?: SellerSignupProfile,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (otp.length !== 6) {
    return { ok: false, message: 'Enter the 6-digit OTP.' };
  }

  try {
    // Seller apps are mobile-OTP only — ignore mustChangePassword password gates.
    const session = await verifySellerOtpSession(mobile, otp, purpose, signup);
    persistSellerAuthSession(session);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: sellerAuthErrorMessage(error, 'Invalid OTP. Please try again.'),
    };
  }
}

export async function requestSellerOtpSend(
  mobile: string,
  purpose: SellerOtpPurpose = 'LOGIN',
  options?: { resend?: boolean },
): Promise<{ ok: boolean; message?: string; resendCooldownSeconds?: number }> {
  try {
    const result = options?.resend
      ? await resendSellerOtp(mobile, purpose)
      : await sendSellerOtp(mobile, purpose);
    return {
      ok: true,
      ...(result.resendCooldownSeconds != null
        ? { resendCooldownSeconds: result.resendCooldownSeconds }
        : {}),
    };
  } catch (error) {
    // An OTP issued moments ago is still valid; let the user enter it.
    if (
      isAxiosError<{ code?: string }>(error) &&
      error.response?.status === 429 &&
      error.response.data?.code === 'AUTH_OTP_RATE_LIMITED'
    ) {
      return {
        ok: true,
        message: 'An OTP was already sent. Enter the code from your SMS.',
      };
    }
    return {
      ok: false,
      message: sellerAuthErrorMessage(error, 'Unable to send OTP. Please try again.'),
    };
  }
}

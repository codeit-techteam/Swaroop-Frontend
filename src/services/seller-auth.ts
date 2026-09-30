import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import {
  DEMO_OTP,
  DEMO_PASSWORD,
  DEMO_PHONE,
  DEMO_SELLER_EMAIL,
  DEVELOPMENT_MODE,
} from '@/config/development';
import { STORAGE_KEYS } from '@/constants';
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
      return 'Unable to reach PetroTrade API. Confirm the backend is running.';
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

export async function sendSellerOtp(mobile: string): Promise<{ sent: true; demoOtp?: string }> {
  const phone = toE164IndianPhone(mobile);
  const response = await apiClient.post(
    '/auth/otp/send',
    { phone, purpose: 'LOGIN' },
    { skipAuth: true, skipRefresh: true } as ApiRequestConfig,
  );
  const data = (response.data as Envelope<{ devOtp?: string }>)?.data ?? response.data;
  return {
    sent: true,
    demoOtp:
      data && typeof data === 'object' && 'devOtp' in data
        ? ((data as { devOtp?: string }).devOtp ?? DEMO_OTP)
        : DEMO_OTP,
  };
}

export async function verifySellerOtpSession(
  mobile: string,
  otp: string,
): Promise<SellerAuthSession> {
  const phone = toE164IndianPhone(mobile);
  const response = await apiClient.post(
    '/auth/otp/verify',
    { phone, otp, purpose: 'LOGIN', roleHint: 'SELLER' },
    { skipAuth: true, skipRefresh: true } as ApiRequestConfig,
  );
  return unwrapSession(response.data);
}

export async function loginSellerWithPassword(
  identifier: string,
  password: string,
): Promise<SellerAuthSession> {
  const trimmed = identifier.trim();
  const digits = trimmed.replace(/\D/g, '');
  const body = trimmed.includes('@')
    ? { email: trimmed.toLowerCase(), password }
    : digits.length >= 10
      ? { phone: toE164IndianPhone(trimmed), password }
      : { identifier: trimmed, password };
  const response = await apiClient.post('/auth/login', body, {
    skipAuth: true,
    skipRefresh: true,
  } as ApiRequestConfig);
  return unwrapSession(response.data);
}

/**
 * Full seller login used by OTP screen.
 * Demo phone + OTP → seeded seller@test.local password session (same as Seller Web).
 * Otherwise tries OTP verify; falls back to demo password login when OTP is DEMO_OTP in DEV.
 */
export async function authenticateSellerFromOtp(
  mobile: string,
  otp: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const digits = mobile.replace(/\D/g, '').slice(-10);
  const isDemoLogin = otp === DEMO_OTP && digits === DEMO_PHONE.slice(-10);

  if (otp.length !== 6) {
    return { ok: false, message: 'Enter the 6-digit OTP.' };
  }

  try {
    if (isDemoLogin) {
      const session = await loginSellerWithPassword(DEMO_SELLER_EMAIL, DEMO_PASSWORD);
      persistSellerAuthSession(session);
      return { ok: true };
    }

    try {
      const session = await verifySellerOtpSession(mobile, otp);
      persistSellerAuthSession(session);
      return { ok: true };
    } catch (error) {
      if (DEVELOPMENT_MODE && otp === DEMO_OTP) {
        const session = await loginSellerWithPassword(DEMO_SELLER_EMAIL, DEMO_PASSWORD);
        persistSellerAuthSession(session);
        return { ok: true };
      }
      return {
        ok: false,
        message: sellerAuthErrorMessage(error, 'Invalid OTP. Please try again.'),
      };
    }
  } catch (error) {
    return {
      ok: false,
      message: sellerAuthErrorMessage(error, 'Unable to authenticate. Please try again.'),
    };
  }
}

export async function requestSellerOtpSend(
  mobile: string,
): Promise<{ ok: true; message?: string }> {
  try {
    await sendSellerOtp(mobile);
    return { ok: true };
  } catch (error) {
    // Match Seller Web: still open OTP screen; demo OTP + password fallback works in DEV.
    return {
      ok: true,
      message: sellerAuthErrorMessage(error, `OTP request failed — use demo OTP ${DEMO_OTP}.`),
    };
  }
}

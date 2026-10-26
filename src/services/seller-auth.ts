import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { DEMO_PASSWORD, DEVELOPMENT_MODE } from '@/config/development';
import { STORAGE_KEYS } from '@/constants';
import { isDevAccount, validateDevOtp } from '@/services/dev-auth';
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
      return 'Unable to reach PetroTrade. Check your internet connection and try again.';
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

export async function sendSellerOtp(mobile: string): Promise<{ sent: true; demoOtp?: string }> {
  const phone = toE164IndianPhone(mobile);
  const response = await apiClient.post('/auth/otp/send', { phone, purpose: 'LOGIN' }, {
    skipAuth: true,
    skipRefresh: true,
  } as ApiRequestConfig);
  const data = (response.data as Envelope<{ devOtp?: string }>)?.data ?? response.data;
  const exposed =
    data && typeof data === 'object' && typeof (data as { devOtp?: string }).devOtp === 'string'
      ? (data as { devOtp: string }).devOtp
      : undefined;
  return {
    sent: true,
    // Only surface server-exposed dev OTP (non-production backend). Never invent 123456.
    ...(exposed ? { demoOtp: exposed } : {}),
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

function sessionRequiresPasswordChange(session: SellerAuthSession): boolean {
  return Boolean(session.user?.mustChangePassword);
}

/**
 * Full seller login used by OTP screen.
 * Verifies against `/auth/otp/verify`. In Metro only, the shared demo phone +
 * DEMO_OTP falls back to password login when the API has AUTH_STRICT_OTP on
 * (fixed 123456 disabled on the remote backend).
 */
export async function authenticateSellerFromOtp(
  mobile: string,
  otp: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (otp.length !== 6) {
    return { ok: false, message: 'Enter the 6-digit OTP.' };
  }

  const finish = (session: SellerAuthSession): { ok: true } | { ok: false; message: string } => {
    if (sessionRequiresPasswordChange(session)) {
      return {
        ok: false,
        message:
          'Your temporary password must be changed first. Sign in once on Seller Web to set a new password, then return to the app.',
      };
    }
    persistSellerAuthSession(session);
    return { ok: true };
  };

  try {
    return finish(await verifySellerOtpSession(mobile, otp));
  } catch (error) {
    if (DEVELOPMENT_MODE && isDevAccount(mobile) && validateDevOtp(otp)) {
      try {
        return finish(await loginSellerWithPassword(mobile, DEMO_PASSWORD));
      } catch {
        // Keep the original OTP error below.
      }
    }
    return {
      ok: false,
      message: sellerAuthErrorMessage(error, 'Invalid OTP. Please try again.'),
    };
  }
}

export async function requestSellerOtpSend(
  mobile: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await sendSellerOtp(mobile);
    return { ok: true };
  } catch (error) {
    // An OTP issued moments ago is still valid; let the user enter it.
    if (isAxiosError(error) && error.response?.status === 429) {
      return { ok: true };
    }
    return {
      ok: false,
      message: sellerAuthErrorMessage(error, 'Unable to send OTP. Please try again.'),
    };
  }
}

import { apiClient } from '@/api/client';
import {
  DEMO_CUSTOMER_EMAIL,
  DEMO_OTP,
  DEMO_PASSWORD,
  DEMO_PHONE,
  DEMO_SELLER_EMAIL,
  DEVELOPMENT_MODE,
} from '@/config/development';
import { STORAGE_KEYS } from '@/constants';
import { useAuthStore } from '@/store/auth-store';
import type { ApiRequestConfig } from '@/types/api';
import { logger } from '@/utils/logger';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

type DevRole = 'customer' | 'seller';

let inflight: Promise<boolean> | null = null;

type LoginPayload = {
  accessToken?: string;
  refreshToken?: string;
};

export const unwrapAuthPayload = (body: unknown): LoginPayload => {
  if (!body || typeof body !== 'object') {
    return {};
  }
  const root = body as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;
  return {
    accessToken: typeof nested.accessToken === 'string' ? nested.accessToken : undefined,
    refreshToken: typeof nested.refreshToken === 'string' ? nested.refreshToken : undefined,
  };
};

export const persistTokens = (payload: LoginPayload): boolean => {
  if (!payload.accessToken) {
    return false;
  }

  setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, payload.accessToken);
  if (payload.refreshToken) {
    setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
  }
  useAuthStore.getState().setTokens(payload.accessToken, payload.refreshToken ?? '');
  return true;
};

export function clearBackendTokens(): void {
  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function resolveDevBackendRole(): DevRole {
  return useAuthStore.getState().selectedRole === 'seller' ? 'seller' : 'customer';
}

/** Demo seller phone signs in as its own account, matching Seller Web OTP login. */
async function loginDemoSellerPhone(): Promise<boolean> {
  const mobile = (getStorageItem(STORAGE_KEYS.SELLER_MOBILE) ?? '').replace(/\D/g, '').slice(-10);
  if (mobile && mobile !== DEMO_PHONE) return false;
  try {
    const response = await apiClient.post(
      '/auth/otp/verify',
      { phone: `+91${DEMO_PHONE}`, otp: DEMO_OTP, purpose: 'LOGIN', roleHint: 'SELLER' },
      { skipAuth: true, skipRefresh: true } as ApiRequestConfig,
    );
    return persistTokens(unwrapAuthPayload(response.data));
  } catch {
    return false;
  }
}

export async function loginDevBackend(role: DevRole = 'customer'): Promise<boolean> {
  if (role === 'seller' && (await loginDemoSellerPhone())) {
    return true;
  }
  const email = role === 'seller' ? DEMO_SELLER_EMAIL : DEMO_CUSTOMER_EMAIL;
  const response = await apiClient.post('/auth/login', { email, password: DEMO_PASSWORD }, {
    skipAuth: true,
    skipRefresh: true,
  } as ApiRequestConfig);
  const payload = unwrapAuthPayload(response.data);
  if (!persistTokens(payload)) {
    throw new Error('Catalog backend login did not return an access token.');
  }
  return true;
}

/**
 * Ensures a valid backend JWT exists in development.
 * When `force` is true (e.g. after 401), clears stale tokens and re-logins.
 */
export async function ensureDevBackendSession(
  role: DevRole = 'customer',
  options?: { force?: boolean },
): Promise<void> {
  if (!DEVELOPMENT_MODE) {
    return;
  }

  const existing = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  const hasUsableToken =
    Boolean(existing) &&
    existing !== 'undefined' &&
    existing !== 'null' &&
    (existing?.length ?? 0) > 20;

  if (!options?.force && hasUsableToken) {
    return;
  }

  if (inflight) {
    await inflight;
    // After a concurrent login finishes, only force-retry if still missing a token.
    const after = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (after && after !== 'undefined' && after.length > 20) {
      return;
    }
  }

  if (options?.force || !hasUsableToken) {
    clearBackendTokens();
  }

  inflight = (async () => {
    try {
      return await loginDevBackend(role);
    } catch (error) {
      logger.error('Dev backend session login failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      inflight = null;
    }
  })();

  const ok = await inflight;
  if (!ok) {
    throw new Error('Unable to authenticate against the catalog backend.');
  }
}

/** Used by the API client after a failed refresh in DEVELOPMENT_MODE. */
export async function recoverDevBackendSession(): Promise<string | null> {
  if (!DEVELOPMENT_MODE) {
    return null;
  }

  try {
    await ensureDevBackendSession(resolveDevBackendRole(), { force: true });
    return getStorageItem(STORAGE_KEYS.ACCESS_TOKEN) ?? null;
  } catch {
    return null;
  }
}

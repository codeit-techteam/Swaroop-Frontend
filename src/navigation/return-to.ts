import type { Href } from 'expo-router';

import { getLoggedInRoute } from '@/navigation/post-auth-route';
import { ROUTES } from '@/navigation/routes';

/** Customer browse routes that guests may open without signing in. */
export const GUEST_BROWSE_PATH_PREFIXES = [
  '/(customer)/(tabs)/market',
  '/(customer)/product/',
  '/(customer)/grades',
  '/market',
  '/product/',
  '/grades',
] as const;

const GUEST_BROWSE_EXACT = new Set([
  '/market',
  '/(customer)/(tabs)/market',
  '/grades',
  '/(customer)/grades',
  '/(customer)/grades/index',
]);

const AUTH_PATH_PREFIXES = ['/(auth)/', '/(onboarding)/', '/(seller)/', '/(public)/'] as const;

const sanitizeParam = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim();
  }
  return undefined;
};

/** True when pathname is a marketplace browse surface (guest-readable). */
export const isGuestBrowsePath = (pathname: string | null | undefined): boolean => {
  if (!pathname) return false;
  const path = (pathname.split('?')[0] ?? pathname).replace(/\/$/, '') || '/';
  if (GUEST_BROWSE_EXACT.has(path)) return true;
  if (path.endsWith('/market')) return true;
  return GUEST_BROWSE_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix),
  );
};

/**
 * Only allow in-app customer/onboarding destinations — reject external URLs and
 * auth loops.
 */
export const isSafeInternalReturnTo = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return false;
  if (trimmed.includes('://') || trimmed.includes('\\')) return false;
  if (AUTH_PATH_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return false;
  if (trimmed.startsWith('/(customer)') || trimmed.startsWith('/product') || trimmed.startsWith('/grades') || trimmed.startsWith('/market') || trimmed.startsWith('/cart') || trimmed.startsWith('/checkout') || trimmed.startsWith('/profile') || trimmed.startsWith('/order') || trimmed.startsWith('/shipment') || trimmed.startsWith('/import') || trimmed.startsWith('/notifications') || trimmed.startsWith('/credit') || trimmed.startsWith('/payment') || trimmed.startsWith('/procurement') || trimmed.startsWith('/dispatch') || trimmed.startsWith('/delivery') || trimmed.startsWith('/loading') || trimmed.startsWith('/purchase')) {
    return true;
  }
  return trimmed.startsWith('/(customer)');
};

export const parseReturnToParam = (
  value: string | string[] | undefined,
): string | undefined => {
  const raw = sanitizeParam(value);
  if (!raw) return undefined;
  try {
    const decoded = decodeURIComponent(raw);
    return isSafeInternalReturnTo(decoded) ? decoded : undefined;
  } catch {
    return isSafeInternalReturnTo(raw) ? raw : undefined;
  }
};

/** Build login href that preserves the intended destination. */
export const buildLoginHref = (returnTo?: string | null): Href => {
  const safe = returnTo && isSafeInternalReturnTo(returnTo) ? returnTo : undefined;
  if (!safe) {
    return ROUTES.AUTH.CUSTOMER_LOGIN as Href;
  }
  return {
    pathname: ROUTES.AUTH.CUSTOMER_LOGIN,
    params: { returnTo: safe },
  } as unknown as Href;
};

/** Build current path + query for returnTo (expo-router style). */
export const buildReturnToFromParts = (
  pathname: string | null | undefined,
  params?: Record<string, string | string[] | undefined>,
): string => {
  const path = (pathname ?? ROUTES.CUSTOMER.MARKET).split('?')[0] || ROUTES.CUSTOMER.MARKET;
  if (!params || Object.keys(params).length === 0) {
    return path;
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'returnTo') continue;
    const v = sanitizeParam(value);
    if (v) search.set(key, v);
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
};

export const resolvePostAuthHref = (input: {
  returnTo?: string | null;
  kycApproved: boolean;
  reviewSubmitted: boolean;
}): Href => {
  const safe = input.returnTo && isSafeInternalReturnTo(input.returnTo) ? input.returnTo : null;
  if (safe && input.kycApproved) {
    return safe as Href;
  }
  return getLoggedInRoute({
    kycApproved: input.kycApproved,
    reviewSubmitted: input.reviewSubmitted,
  });
};

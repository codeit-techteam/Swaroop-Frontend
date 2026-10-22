import type { ReactNode } from 'react';

import { Redirect, useGlobalSearchParams, usePathname, type Href } from 'expo-router';

import { getLoggedInRoute } from '@/navigation/post-auth-route';
import {
  buildLoginHref,
  buildReturnToFromParts,
  isGuestBrowsePath,
} from '@/navigation/return-to';
import { ROUTES } from '@/navigation/routes';
import {
  selectIsHydrated,
  selectIsLoggedIn,
  selectKycApproved,
  useAuthStore,
} from '@/store/auth-store';

type AuthGuardProps = {
  children: ReactNode;
};

const toCustomerReturnTo = (
  pathname: string | null,
  params: Record<string, string | string[] | undefined>,
): string => {
  if (!pathname) return ROUTES.CUSTOMER.MARKET;
  if (pathname.includes('(customer)')) {
    return buildReturnToFromParts(pathname, params);
  }
  if (pathname === '/market' || pathname.endsWith('/market')) {
    return ROUTES.CUSTOMER.MARKET;
  }
  if (pathname.startsWith('/product')) {
    return buildReturnToFromParts(`/(customer)${pathname}`, params);
  }
  if (pathname.startsWith('/grades')) {
    return buildReturnToFromParts(`/(customer)${pathname}`, params);
  }
  if (pathname.startsWith('/')) {
    return buildReturnToFromParts(`/(customer)${pathname}`, params);
  }
  return buildReturnToFromParts(pathname, params);
};

export const PrivateRouteGuard = ({ children }: AuthGuardProps): ReactNode => {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const kycApproved = useAuthStore(selectKycApproved);
  const reviewSubmitted = useAuthStore((state) => state.reviewSubmitted);
  const isHydrated = useAuthStore(selectIsHydrated);
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  if (!isHydrated) {
    return null;
  }

  if (!isLoggedIn) {
    if (isGuestBrowsePath(pathname)) {
      return children;
    }
    return (
      <Redirect
        href={buildLoginHref(
          toCustomerReturnTo(
            pathname,
            params as Record<string, string | string[] | undefined>,
          ),
        )}
      />
    );
  }

  if (!kycApproved) {
    return <Redirect href={getLoggedInRoute({ kycApproved, reviewSubmitted })} />;
  }

  return children;
};

/**
 * Customer stack: guests may browse market / grades / product details.
 * Cart, checkout, orders, docs, profile, and other account surfaces stay gated.
 */
export const CustomerRouteGuard = ({ children }: AuthGuardProps): ReactNode => {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const kycApproved = useAuthStore(selectKycApproved);
  const reviewSubmitted = useAuthStore((state) => state.reviewSubmitted);
  const isHydrated = useAuthStore(selectIsHydrated);
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  if (!isHydrated) {
    return null;
  }

  if (!isLoggedIn) {
    if (isGuestBrowsePath(pathname)) {
      return children;
    }
    return (
      <Redirect
        href={buildLoginHref(
          toCustomerReturnTo(
            pathname,
            params as Record<string, string | string[] | undefined>,
          ),
        )}
      />
    );
  }

  if (!kycApproved && !isGuestBrowsePath(pathname)) {
    return <Redirect href={getLoggedInRoute({ kycApproved, reviewSubmitted })} />;
  }

  return children;
};

export const PublicRouteGuard = ({ children }: AuthGuardProps): ReactNode => {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const kycApproved = useAuthStore(selectKycApproved);
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return null;
  }

  if (isLoggedIn && kycApproved) {
    return <Redirect href={ROUTES.CUSTOMER.HOME as Href} />;
  }

  return children;
};

import type { ReactNode } from 'react';

import { Redirect, type Href } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/store/auth-store';

type AuthGuardProps = {
  children: ReactNode;
};

export const PrivateRouteGuard = ({ children }: AuthGuardProps): ReactNode => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.AUTH.LOGIN as Href} />;
  }

  return children;
};

export const PublicRouteGuard = ({ children }: AuthGuardProps): ReactNode => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href={ROUTES.PRIVATE.ROOT as Href} />;
  }

  return children;
};

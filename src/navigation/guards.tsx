import type { ReactNode } from 'react';

import { Redirect, type Href } from 'expo-router';

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

export const PrivateRouteGuard = ({ children }: AuthGuardProps): ReactNode => {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const kycApproved = useAuthStore(selectKycApproved);
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return null;
  }

  if (!isLoggedIn || !kycApproved) {
    return <Redirect href={ROUTES.AUTH.CUSTOMER_LOGIN as Href} />;
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

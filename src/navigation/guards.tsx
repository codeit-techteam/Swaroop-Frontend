import type { ReactNode } from 'react';

import { Redirect, type Href } from 'expo-router';

import { getLoggedInRoute } from '@/navigation/post-auth-route';
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
  const reviewSubmitted = useAuthStore((state) => state.reviewSubmitted);
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect href={ROUTES.AUTH.CUSTOMER_LOGIN as Href} />;
  }

  if (!kycApproved) {
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

import { Redirect, type Href } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import {
  selectIsHydrated,
  selectIsLoggedIn,
  selectKycApproved,
  selectOnboardingCompleted,
  useAuthStore,
} from '@/store/auth-store';

export default function IndexRoute() {
  const isHydrated = useAuthStore(selectIsHydrated);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const kycApproved = useAuthStore(selectKycApproved);
  const onboardingCompleted = useAuthStore(selectOnboardingCompleted);

  if (!isHydrated) {
    return null;
  }

  if (isLoggedIn && kycApproved) {
    return <Redirect href={ROUTES.CUSTOMER.HOME as Href} />;
  }

  if (isLoggedIn && !kycApproved) {
    return <Redirect href={ROUTES.AUTH.BUSINESS_INFORMATION as Href} />;
  }

  if (onboardingCompleted) {
    return <Redirect href={ROUTES.AUTH.ROLE_SELECTION as Href} />;
  }

  return <Redirect href={ROUTES.ONBOARDING.SPLASH as Href} />;
}

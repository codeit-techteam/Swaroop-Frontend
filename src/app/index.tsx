import { SplashScreen } from '@/features/splash';
import { selectIsHydrated, useAuthStore } from '@/store/auth-store';

export default function IndexRoute() {
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return null;
  }

  // The branded splash is the guaranteed launch gate on every cold start. It
  // plays its animation and then routes to the correct destination based on the
  // hydrated session (see SplashScreen.routeAfterSplash).
  return <SplashScreen />;
}

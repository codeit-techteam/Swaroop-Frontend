import { Redirect, type Href } from 'expo-router';

import { ROUTES } from '@/navigation/routes';

export default function IndexRoute() {
  return <Redirect href={ROUTES.ONBOARDING.SPLASH as Href} />;
}

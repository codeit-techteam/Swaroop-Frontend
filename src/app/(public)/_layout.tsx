import { Stack } from 'expo-router';

import { PublicRouteGuard } from '@/navigation/guards';

export default function PublicLayout() {
  return (
    <PublicRouteGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </PublicRouteGuard>
  );
}

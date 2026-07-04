import { Stack } from 'expo-router';

import { PrivateRouteGuard } from '@/navigation/guards';

export default function PrivateLayout() {
  return (
    <PrivateRouteGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </PrivateRouteGuard>
  );
}

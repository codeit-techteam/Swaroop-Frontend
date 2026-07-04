import { Text, View } from 'react-native';

import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="font-semibold text-xl text-foreground">Page not found</Text>
        <Link href="/" className="mt-4 text-primary">
          Go to home
        </Link>
      </View>
    </>
  );
}

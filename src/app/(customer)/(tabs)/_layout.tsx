import { Tabs } from 'expo-router';

import { BottomNavigation } from '@/components/home';
import { brandColors } from '@/theme/colors';

export const unstable_settings = {
  anchor: 'home',
};

export default function CustomerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: brandColors.white,
        },
      }}
      backBehavior="initialRoute"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

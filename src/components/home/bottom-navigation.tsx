import { memo, useCallback, type ReactElement } from 'react';

import { Pressable, View } from 'react-native';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { HomeTabIcon, MarketTabIcon, OrdersTabIcon, ProfileIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const TAB_META: Record<
  string,
  {
    label: string;
    icon: (props: { color: string; focused: boolean }) => ReactElement;
  }
> = {
  home: {
    label: 'HOME',
    icon: ({ color, focused }) => <HomeTabIcon color={color} filled={focused} />,
  },
  market: {
    label: 'MARKET',
    icon: ({ color }) => <MarketTabIcon color={color} />,
  },
  orders: {
    label: 'ORDERS',
    icon: ({ color }) => <OrdersTabIcon color={color} />,
  },
  profile: {
    label: 'PROFILE',
    icon: ({ color }) => <ProfileIcon color={color} size={24} />,
  },
};

type TabItemProps = {
  routeKey: string;
  routeName: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

const TabItem = memo(function TabItem({
  routeName,
  label,
  focused,
  onPress,
  onLongPress,
}: TabItemProps) {
  const color = focused ? brandColors.primary : brandColors.muted;
  const meta = TAB_META[routeName];

  if (!meta) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      className="flex-1 items-center justify-center"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="items-center">
        {meta.icon({ color, focused })}
        <Typography
          variant="fieldLabel"
          className={cn(
            'mt-xs text-[10px] tracking-[0.8px]',
            focused ? 'text-brand-primary' : 'text-brand-muted',
          )}
        >
          {label}
        </Typography>
      </View>
    </Pressable>
  );
});

export const BottomNavigation = memo(function BottomNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation],
  );

  const handleLongPress = useCallback(
    (routeKey: string) => {
      navigation.emit({
        type: 'tabLongPress',
        target: routeKey,
      });
    },
    [navigation],
  );

  return (
    <View
      className="border-t border-brand-border bg-brand-white"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row" style={{ height: TAB_BAR_HEIGHT }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const meta = TAB_META[route.name];
          const label = meta?.label ?? options.title ?? route.name;

          return (
            <TabItem
              key={route.key}
              routeKey={route.key}
              routeName={route.name}
              label={label}
              focused={isFocused}
              onPress={() => handlePress(route.key, route.name, isFocused)}
              onLongPress={() => handleLongPress(route.key)}
            />
          );
        })}
      </View>
    </View>
  );
});

import { memo, useCallback } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NotificationCard,
  NotificationFilterTabs,
  NotificationsEmptyState,
  NotificationsSkeleton,
} from '@/components/notifications';
import { AppHeader, ScreenWrapper, Typography } from '@/components';
import { useCustomerNotifications } from '@/hooks/use-notifications';
import { CheckCircleIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { getNotificationRoute } from '@/services/notifications';
import { brandColors } from '@/theme/colors';
import type { CustomerNotification } from '@/types/notifications';

export const NotificationsScreen = memo(function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    selectedFilter,
    setSelectedFilter,
    groups,
    unreadCount,
    isLoading,
    isRefreshing,
    hasNotifications,
    canLoadMore,
    refresh,
    handleMarkRead,
    handleMarkAllRead,
    handleLoadMore,
  } = useCustomerNotifications();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.PROFILE as Href);
  }, [router]);

  const openNotification = useCallback(
    (notification: CustomerNotification) => {
      handleMarkRead(notification.id);
      router.push(getNotificationRoute(notification) as Href);
    },
    [handleMarkRead, router],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="px-xl">
        <AppHeader variant="back" title="Notifications" onBack={handleBack} />
      </View>

      <View className="mt-md px-xl">
        <NotificationFilterTabs selected={selectedFilter} onSelect={setSelectedFilter} />
      </View>

      <View className="mt-md flex-row items-center justify-between px-xl">
        <Typography variant="roleDescription" className="text-brand-body">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </Typography>
        {unreadCount > 0 ? (
          <Pressable
            onPress={handleMarkAllRead}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            className="flex-row items-center gap-xs"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <CheckCircleIcon size={16} color={brandColors.primary} />
            <Typography variant="link" className="text-[13px] font-semibold text-brand-primary">
              Mark all read
            </Typography>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        className="mt-md flex-1 px-xl"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
        }
      >
        {isLoading ? (
          <NotificationsSkeleton />
        ) : !hasNotifications ? (
          <View className="mt-lg">
            <NotificationsEmptyState />
          </View>
        ) : (
          <View className="gap-xl">
            {groups.map((group) => (
              <View key={group.key}>
                <Typography
                  variant="badge"
                  className="text-[11px] uppercase tracking-wide text-brand-body"
                >
                  {group.label}
                </Typography>
                <View className="mt-md gap-md">
                  {group.items.map((notification, index) => (
                    <Animated.View
                      key={notification.id}
                      entering={FadeInDown.delay(index * 50).duration(260)}
                    >
                      <NotificationCard
                        notification={notification}
                        onPress={() => openNotification(notification)}
                        onActionPress={() => openNotification(notification)}
                      />
                    </Animated.View>
                  ))}
                </View>
              </View>
            ))}

            {canLoadMore ? (
              <Pressable
                onPress={handleLoadMore}
                accessibilityRole="button"
                accessibilityLabel="Load older notifications"
                className="items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Typography variant="link" className="text-brand-primary">
                  Load Older Notifications
                </Typography>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
});

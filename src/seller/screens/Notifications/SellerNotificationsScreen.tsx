import { memo, useCallback } from 'react';

import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  NotificationActionCard,
  NotificationActivityItem,
  NotificationFilterTabs,
  NotificationsListSkeleton,
  EmptyState,
  SellerHeader,
} from '@/seller/components';
import { useSellerNotifications } from '@/seller/hooks/useSellerNotifications';

const ACTION_ROUTE_MAP: Record<string, string> = {
  payments: ROUTES.SELLER.SETTLEMENTS,
  inventory: ROUTES.SELLER.INVENTORY,
  'settlement-documents': ROUTES.SELLER.SETTLEMENT_DOCUMENTS,
};

export const SellerNotificationsScreen = memo(function SellerNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    selectedCategory,
    setSelectedCategory,
    filteredCriticalActions,
    filteredRecentActivity,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNotifications,
    canLoadMore,
    refresh,
    handleMarkRead,
    handleDelete,
    handleLoadMore,
  } = useSellerNotifications();

  const navigateAction = useCallback(
    (actionId: string, notificationId: string) => {
      handleMarkRead(notificationId);
      const notification = filteredCriticalActions.find((item) =>
        item.actions?.some((action) => action.id === actionId),
      );
      const action = notification?.actions?.find((item) => item.id === actionId);
      if (action?.route && ACTION_ROUTE_MAP[action.route]) {
        router.push(ACTION_ROUTE_MAP[action.route] as Href);
      }
    },
    [filteredCriticalActions, handleMarkRead, router],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Notifications"
        showBack
        showBell
        rightActionLabel="Support"
        onBack={() => router.back()}
        onBellPress={() => undefined}
        onRightActionPress={() => router.push(ROUTES.SELLER.SUPPORT as Href)}
      />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
      >
        <View className="mt-md">
          <NotificationFilterTabs selected={selectedCategory} onSelect={setSelectedCategory} />
        </View>

        {isLoading ? (
          <View className="mt-lg">
            <NotificationsListSkeleton />
          </View>
        ) : !hasNotifications ? (
          <View className="mt-xl">
            <EmptyState variant="no_notifications" />
          </View>
        ) : (
          <>
            {filteredCriticalActions.length > 0 ? (
              <View className="mt-lg">
                <Typography variant="badge" className="text-[11px] uppercase tracking-wide text-brand-body">
                  Critical Actions Required
                </Typography>
                <View className="mt-md gap-md">
                  {filteredCriticalActions.map((notification, index) => (
                    <Animated.View
                      key={notification.id}
                      entering={FadeInDown.delay(index * 60).duration(280)}
                    >
                      <NotificationActionCard
                        notification={notification}
                        onActionPress={(actionId) => navigateAction(actionId, notification.id)}
                      />
                    </Animated.View>
                  ))}
                </View>
              </View>
            ) : null}

            {filteredRecentActivity.length > 0 ? (
              <View className="mt-xl">
                <Typography variant="badge" className="text-[11px] uppercase tracking-wide text-brand-body">
                  Recent Activity
                </Typography>
                <View className="mt-md overflow-hidden rounded-2xl border border-brand-border bg-brand-white">
                  {filteredRecentActivity.map((notification, index) => (
                    <Animated.View
                      key={notification.id}
                      entering={FadeInDown.delay(index * 50).duration(260)}
                    >
                      <Swipeable
                        renderRightActions={() => (
                          <View className="flex-row">
                            <RectButton
                              onPress={() => handleMarkRead(notification.id)}
                              style={{
                                width: 96,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#5B84B1',
                              }}
                            >
                              <Typography variant="badge" className="text-brand-white">
                                Read
                              </Typography>
                            </RectButton>
                            <RectButton
                              onPress={() => handleDelete(notification.id)}
                              style={{
                                width: 96,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#EF4444',
                              }}
                            >
                              <Typography variant="badge" className="text-brand-white">
                                Delete
                              </Typography>
                            </RectButton>
                          </View>
                        )}
                      >
                        <View className={index > 0 ? 'border-t border-brand-border' : undefined}>
                          <NotificationActivityItem
                            notification={notification}
                            onPress={() => handleMarkRead(notification.id)}
                          />
                        </View>
                      </Swipeable>
                    </Animated.View>
                  ))}
                </View>
              </View>
            ) : null}

            {canLoadMore ? (
              <Pressable
                onPress={() => void handleLoadMore()}
                disabled={isLoadingMore}
                className="mt-lg items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
                style={({ pressed }) => ({ opacity: pressed || isLoadingMore ? 0.85 : 1 })}
              >
                <Typography variant="link" className="text-brand-primary">
                  {isLoadingMore ? 'Loading...' : 'Load Previous Notifications'}
                </Typography>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
});

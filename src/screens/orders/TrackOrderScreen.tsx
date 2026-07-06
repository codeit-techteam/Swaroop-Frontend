import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BlindMarketplaceNotice,
  OrderInformationCard,
  OrderStatusBadge,
  TrackingMoreMenuSheet,
  TrackingStatusCard,
} from '@/components/tracking';
import { NotificationBadge } from '@/components/home/notification-badge';
import { PrimaryButton, Typography } from '@/components/ui';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { BackArrowIcon, BellIcon, DownloadIcon, MoreVerticalIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const TrackOrderScreen = memo(function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const {
    order,
    timelineItems,
    trackingStatus,
    canCancelOrder,
    moreMenuRef,
    handleBack,
    handleNotifications,
    handleOpenMoreMenu,
    handleMoreMenuAction,
    handleDownloadSummary,
  } = useOrderTracking();

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center">
            <Pressable
              onPress={handleBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="mr-sm h-10 w-10 items-center justify-center"
            >
              <BackArrowIcon color={brandColors.heading} />
            </Pressable>
            <Typography
              variant="roleTitle"
              className="text-[17px] text-brand-heading"
              numberOfLines={1}
            >
              Track Order
            </Typography>
          </View>

          <View className="flex-row items-center">
            <Pressable
              onPress={handleNotifications}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="relative h-10 w-10 items-center justify-center"
            >
              <BellIcon size={iconSizes.lg} color={brandColors.heading} />
              <NotificationBadge visible />
            </Pressable>

            <Pressable
              onPress={handleOpenMoreMenu}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="More options"
              className="h-10 w-10 items-center justify-center"
            >
              <MoreVerticalIcon size={iconSizes.lg} color={brandColors.heading} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 120,
        }}
      >
        {order ? (
          <>
            <View className="mb-lg flex-row items-center justify-between">
              <Typography variant="headingLeft" className="text-[18px] text-brand-heading">
                Order Tracking
              </Typography>
              <OrderStatusBadge status={trackingStatus} />
            </View>

            <TrackingStatusCard items={timelineItems} />
            <OrderInformationCard order={order} className="mt-lg" />
            <BlindMarketplaceNotice className="mt-lg" />
          </>
        ) : (
          <Typography variant="subheadingLeft" className="text-center text-brand-body">
            Order not found.
          </Typography>
        )}
      </ScrollView>

      {order ? (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <PrimaryButton
            label="Download Order Summary"
            onPress={handleDownloadSummary}
            leftIcon={<DownloadIcon size={iconSizes.md} color={brandColors.white} />}
            className="bg-brand-heading"
          />
        </View>
      ) : null}

      <TrackingMoreMenuSheet
        ref={moreMenuRef}
        canCancelOrder={canCancelOrder}
        onAction={handleMoreMenuAction}
      />
    </View>
  );
});

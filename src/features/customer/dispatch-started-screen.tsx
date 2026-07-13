import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DispatchLiveStatusCard,
  DispatchOrderSummaryCard,
  DispatchSecurityCard,
  DispatchShipmentDetailsCard,
  DispatchSuccessHeroCard,
  DispatchTimelineCard,
} from '@/components/dispatch';
import { NotificationBadge } from '@/components/home/notification-badge';
import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import { DISPATCH_STARTED_COPY } from '@/constants/dispatchStarted';
import { useDispatchStarted } from '@/hooks/useDispatchStarted';
import { BackArrowIcon, BellIcon, OrdersTabIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerDispatchStartedScreen = memo(function CustomerDispatchStartedScreen() {
  const insets = useSafeAreaInsets();
  const {
    order,
    timelineSteps,
    handleBack,
    handleNotifications,
    handleTrackShipment,
    handleGoToOrders,
  } = useDispatchStarted();

  if (!order) {
    return (
      <View className="flex-1 bg-brand-background">
        <View
          className="border-b border-brand-border bg-brand-white px-lg"
          style={{ paddingTop: insets.top }}
        >
          <View className="h-14 flex-row items-center">
            <Pressable
              onPress={handleBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center"
            >
              <BackArrowIcon color={brandColors.heading} />
            </Pressable>
            <Typography variant="roleTitle" className="ml-sm text-[17px] text-brand-heading">
              {DISPATCH_STARTED_COPY.headerTitle}
            </Typography>
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="subheadingLeft" className="text-center text-brand-body">
            Order not found. Please return to your orders.
          </Typography>
          <PrimaryButton label="Go To Orders" onPress={handleGoToOrders} className="mt-lg" />
        </View>
      </View>
    );
  }

  const shipmentDetails = order.shipmentDetails;

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
              {DISPATCH_STARTED_COPY.headerTitle}
            </Typography>
          </View>

          <Pressable
            onPress={handleNotifications}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="relative h-10 w-10 items-center justify-center"
          >
            <BellIcon size={iconSizes.lg} color={brandColors.primary} />
            <NotificationBadge visible />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 140,
        }}
      >
        <DispatchSuccessHeroCard />

        {shipmentDetails ? (
          <>
            <DispatchLiveStatusCard
              dispatchTime={shipmentDetails.dispatchTime}
              progress={order.dispatchProgress}
              className="mt-lg"
            />

            <DispatchShipmentDetailsCard
              orderId={order.id}
              product={order.productName}
              quantityMt={order.quantityMt}
              warehouse={order.warehouse}
              destination={order.destination}
              shipmentDetails={shipmentDetails}
              className="mt-lg"
            />
          </>
        ) : null}

        <DispatchSecurityCard className="mt-lg" />
        <DispatchTimelineCard steps={timelineSteps} className="mt-lg" />

        <DispatchOrderSummaryCard
          product={order.productName}
          quantityMt={order.quantityMt}
          grandTotal={order.amount}
          className="mt-lg"
        />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12, gap: 12 }}
      >
        <PrimaryButton
          label={DISPATCH_STARTED_COPY.trackShipment}
          onPress={handleTrackShipment}
          leftIcon={<TruckIcon size={iconSizes.md} color={brandColors.white} />}
          className="bg-brand-heading"
        />
        <SecondaryButton
          label={DISPATCH_STARTED_COPY.goToOrders}
          onPress={handleGoToOrders}
          variant="outline"
          leftIcon={<OrdersTabIcon size={iconSizes.md} color={brandColors.primary} />}
        />
      </View>
    </View>
  );
});

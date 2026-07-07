import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import {
  MarketPriceLockCard,
  OrderConfirmationInfoCard,
  OrderDetailsCard,
  OrderStatusCard,
  OrderSubmittedCard,
  ValidationTimeline,
} from '@/components/order';
import { SecondaryButton, Typography } from '@/components/ui';
import { ORDER_CONFIRMATION_COPY } from '@/constants/orderTimeline';
import { useOrderConfirmation } from '@/hooks/useOrderConfirmation';
import { BackArrowIcon, BellIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerOrderAwaitingConfirmationScreen = memo(
  function CustomerOrderAwaitingConfirmationScreen() {
    const insets = useSafeAreaInsets();
    const {
      order,
      destination,
      timelineSteps,
      countdown,
      handleContactSupport,
      handleBack,
      handleNotifications,
    } = useOrderConfirmation();

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
                {ORDER_CONFIRMATION_COPY.headerTitle}
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
          <OrderSubmittedCard />

          <MarketPriceLockCard
            formattedTime={countdown.formattedTime}
            priceLockStatus={order?.priceLockStatus ?? 'active'}
            className="mt-lg"
          />

          <OrderConfirmationInfoCard className="mt-lg" />

          {order ? (
            <OrderDetailsCard order={order} destination={destination} className="mt-lg" />
          ) : null}

          <ValidationTimeline steps={timelineSteps} className="mt-lg" />

          <OrderStatusCard className="mt-lg" />
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 12, gap: 12 }}
        >
          <SecondaryButton
            label={ORDER_CONFIRMATION_COPY.contactSupport}
            onPress={handleContactSupport}
            variant="outline"
          />
        </View>
      </View>
    );
  },
);

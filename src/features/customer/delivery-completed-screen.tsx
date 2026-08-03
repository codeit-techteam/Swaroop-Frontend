import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DeliveryInformationCard,
  DeliveryNextStepCard,
  DeliveryProofGallery,
  DeliverySuccessHeroCard,
  DeliverySummaryCard,
  DeliveryTimelineCard,
  DigitalPodCard,
  ReceiverDetailsCard,
} from '@/components/delivery';
import { NotificationBadge } from '@/components/home/notification-badge';
import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import { DELIVERY_COMPLETED_COPY } from '@/constants/deliveryCompleted';
import { useDeliveryCompleted } from '@/hooks/useDeliveryCompleted';
import { BackArrowIcon, BellIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerDeliveryCompletedScreen = memo(function CustomerDeliveryCompletedScreen() {
  const insets = useSafeAreaInsets();
  const {
    order,
    timelineSteps,
    handleBack,
    handleNotifications,
    handleContinueToPayment,
    handleViewOrderDetails,
  } = useDeliveryCompleted();

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
              {DELIVERY_COMPLETED_COPY.headerTitle}
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
          paddingBottom: insets.bottom + 160,
        }}
      >
        <DeliverySuccessHeroCard />

        {order ? (
          <>
            <DeliveryInformationCard order={order} className="mt-lg" />

            {order.deliveryReceiver ? (
              <ReceiverDetailsCard receiver={order.deliveryReceiver} className="mt-lg" />
            ) : null}

            {order.digitalPod ? (
              <DigitalPodCard pod={order.digitalPod} className="mt-lg" />
            ) : null}

            {order.deliveryProof ? (
              <DeliveryProofGallery items={order.deliveryProof.items} className="mt-lg" />
            ) : null}

            {order.deliverySummary ? (
              <DeliverySummaryCard summary={order.deliverySummary} className="mt-lg" />
            ) : null}
          </>
        ) : null}

        <DeliveryNextStepCard className="mt-lg" />
        <DeliveryTimelineCard steps={timelineSteps} className="mt-lg" />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12, gap: 12 }}
      >
        <PrimaryButton
          label={DELIVERY_COMPLETED_COPY.continueLabel}
          onPress={handleContinueToPayment}
          disabled={!order}
        />
        <SecondaryButton
          label={DELIVERY_COMPLETED_COPY.viewDetailsLabel}
          onPress={handleViewOrderDetails}
          variant="outline"
          disabled={!order}
        />
      </View>
    </View>
  );
});

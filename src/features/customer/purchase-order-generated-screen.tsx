import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/components/home/notification-badge';
import {
  BlindMarketplaceNotice,
  OrderDocumentsCard,
  PurchaseOrderInfoCard,
  PurchaseOrderSuccessCard,
  TransactionScopeCard,
  WorkflowVerificationTimeline,
} from '@/components/order';
import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import { PURCHASE_ORDER_COPY } from '@/constants/purchaseOrderTimeline';
import { usePurchaseOrder } from '@/hooks/usePurchaseOrder';
import { BackArrowIcon, BellIcon, OrdersTabIcon, PetroTradeLogo, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerPurchaseOrderGeneratedScreen = memo(
  function CustomerPurchaseOrderGeneratedScreen() {
    const insets = useSafeAreaInsets();
    const {
      order,
      poNumber,
      timelineSteps,
      handleTrackShipment,
      handleGoToOrders,
      handleBack,
      handleNotifications,
    } = usePurchaseOrder();

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
                {PURCHASE_ORDER_COPY.headerTitle}
              </Typography>
            </View>

            <View className="flex-row items-center">
              <PetroTradeLogo size={32} />
              <Pressable
                onPress={handleNotifications}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                className="relative ml-sm h-10 w-10 items-center justify-center"
              >
                <BellIcon size={iconSizes.lg} color={brandColors.primary} />
                <NotificationBadge visible />
              </Pressable>
            </View>
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
          <PurchaseOrderSuccessCard />

          {order && poNumber ? (
            <>
              <PurchaseOrderInfoCard
                poNumber={poNumber}
                orderNumber={order.id}
                className="mt-lg"
              />

              <TransactionScopeCard
                material={order.productName}
                netWeight={`${order.quantityMt} MT`}
                originHub={order.warehouse}
                dispatchReadiness={order.dispatchReadiness ?? ''}
                transitWindow={order.transitWindow ?? ''}
                className="mt-lg"
              />
            </>
          ) : null}

          <WorkflowVerificationTimeline steps={timelineSteps} className="mt-lg" />

          <OrderDocumentsCard className="mt-lg" />

          <BlindMarketplaceNotice className="mt-lg" />
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 12, gap: 12 }}
        >
          <PrimaryButton
            label={PURCHASE_ORDER_COPY.trackShipment}
            onPress={handleTrackShipment}
            leftIcon={<TruckIcon size={iconSizes.md} color={brandColors.white} />}
            className="bg-brand-heading"
          />
          <SecondaryButton
            label={PURCHASE_ORDER_COPY.goToOrders}
            onPress={handleGoToOrders}
            variant="outline"
            leftIcon={<OrdersTabIcon size={iconSizes.md} color={brandColors.primary} />}
          />
        </View>
      </View>
    );
  },
);

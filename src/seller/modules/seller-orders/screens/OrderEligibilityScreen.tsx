import { memo, useMemo, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { InfoIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  ConfirmationBottomSheet,
  CreditAssessmentCard,
  DestinationCard,
  OrderStatusBadge,
  OrderSummaryCard,
  RejectReasonSheet,
  TradeBehaviourCard,
} from '@/seller/modules/seller-orders/components';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import type { SellerRejectReason } from '@/seller/modules/seller-orders/types/sellerOrders';
import { SellerHeader } from '@/seller/components';
import { brandColors } from '@/theme/colors';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const OrderEligibilityScreen = memo(function OrderEligibilityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const getOrder = useSellerOrdersStore((state) => state.getOrder);
  const acceptOrder = useSellerOrdersStore((state) => state.acceptOrder);
  const rejectOrder = useSellerOrdersStore((state) => state.rejectOrder);
  const selectOrder = useSellerOrdersStore((state) => state.selectOrder);

  const [showAcceptSheet, setShowAcceptSheet] = useState(false);
  const [showRejectSheet, setShowRejectSheet] = useState(false);
  const [rejectReason, setRejectReason] = useState<SellerRejectReason>('Insufficient Inventory');
  const [rejectRemarks, setRejectRemarks] = useState('');

  const order = useMemo(() => (orderId ? getOrder(orderId) : undefined), [getOrder, orderId]);

  if (!order) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <Typography variant="roleTitle">Order not found.</Typography>
      </ScreenWrapper>
    );
  }

  const isPending = order.orderStatus === 'pending';

  const handleAccept = () => {
    selectOrder(order.id);
    const accepted = acceptOrder(order.id);
    setShowAcceptSheet(false);
    if (accepted) {
      router.replace(`${ROUTES.SELLER.ORDER_ACCEPTED}?orderId=${accepted.id}` as Href);
    }
  };

  const handleReject = () => {
    const rejected = rejectOrder(order.id, rejectReason, rejectRemarks);
    setShowRejectSheet(false);
    setRejectRemarks('');
    if (rejected) {
      router.replace(`${ROUTES.SELLER.ORDER_REJECTED}?orderId=${rejected.id}` as Href);
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Order Eligibility" showBack onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (isPending ? 140 : 32) }}
      >
        <Typography variant="fieldLabel">REFERENCE ID</Typography>
        <Typography variant="headingLeft" className="mt-xs text-[28px]">
          #{order.orderId}
        </Typography>

        <View className="mt-md flex-row items-center gap-md">
          {isPending ? (
            <View className="rounded-full bg-[#EEF2FF] px-sm py-xs">
              <Typography variant="badge" className="text-[10px] text-brand-primary">
                PENDING REVIEW
              </Typography>
            </View>
          ) : (
            <OrderStatusBadge status={order.orderStatus} />
          )}
          <Typography variant="legal" className="text-brand-body">
            Created: {formatDate(order.createdAt)}
          </Typography>
        </View>

        <View className="mt-lg gap-lg">
          <OrderSummaryCard order={order} />
          <DestinationCard order={order} />
          <CreditAssessmentCard order={order} />
          <TradeBehaviourCard behaviour={order.tradeBehaviour} />

          <View className="rounded-[20px] bg-[#EEF4FF] p-lg">
            <View className="flex-row items-start gap-sm">
              <InfoIcon size={18} color={brandColors.primaryDark} />
              <Typography variant="roleDescription" className="flex-1 text-left text-brand-body">
                Buyer identity remains hidden until order acceptance. All communication is managed
                through PetroTrade.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {isPending ? (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <PrimaryButton label="Accept Order" onPress={() => setShowAcceptSheet(true)} />
          <View className="mt-sm">
            <SecondaryButton
              label="Reject Order"
              variant="outline"
              onPress={() => setShowRejectSheet(true)}
            />
          </View>
        </View>
      ) : null}

      <ConfirmationBottomSheet
        visible={showAcceptSheet}
        title="Accept this order?"
        message="Inventory is available. Proceed?"
        onCancel={() => setShowAcceptSheet(false)}
        onConfirm={handleAccept}
      />

      <RejectReasonSheet
        visible={showRejectSheet}
        reason={rejectReason}
        remarks={rejectRemarks}
        onReasonChange={setRejectReason}
        onRemarksChange={setRejectRemarks}
        onCancel={() => {
          setShowRejectSheet(false);
          setRejectRemarks('');
        }}
        onReject={handleReject}
      />
    </ScreenWrapper>
  );
});

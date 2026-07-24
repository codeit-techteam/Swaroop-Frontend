import { memo, useCallback, useEffect, useMemo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import {
  PaymentHeader,
  PaymentMethodCard,
  PaymentSummaryCard,
  StickyPaymentBar,
  SupportCard,
} from '@/components/payment';
import { Typography } from '@/components/ui/typography';
import { getPaymentMethodById, PAYMENT_METHODS } from '@/constants/payment';
import { getRouteAfterPaymentSelection } from '@/constants/paymentNavigation';
import { PhoneIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectCartItems, useCartStore } from '@/store/cart-store';
import { selectCheckoutAddress, useCheckoutStore } from '@/store/checkout-store';
import {
  selectOrderHydrated,
  useOrderStore,
} from '@/store/order-store';
import {
  selectPaymentCalculation,
  selectPaymentMethodId,
  usePaymentStore,
} from '@/store/payment-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { PaymentMethodId } from '@/types/payment';
import { buildBlindProductName, buildOrderFromCheckout } from '@/utils/build-order-from-checkout';

export const CustomerPaymentSelectionScreen = memo(function CustomerPaymentSelectionScreen() {
  const router = useRouter();

  const cartItems = useCartStore(selectCartItems);
  const shippingAddress = useCheckoutStore(selectCheckoutAddress);
  const getCheckoutOrderSummary = useCheckoutStore((state) => state.getOrderSummary);

  const checkoutSummary = useMemo(
    () => getCheckoutOrderSummary(cartItems),
    [cartItems, getCheckoutOrderSummary, shippingAddress.id],
  );

  const selectedMethodId = usePaymentStore(selectPaymentMethodId);
  const payment = usePaymentStore(selectPaymentCalculation);
  const setBaseAmount = usePaymentStore((state) => state.setBaseAmount);
  const selectPayment = usePaymentStore((state) => state.selectPayment);
  const hydratePayment = usePaymentStore((state) => state.hydratePayment);
  const isHydrated = usePaymentStore((state) => state.isHydrated);
  const isOrderHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const createOrder = useOrderStore((state) => state.createOrder);

  useEffect(() => {
    if (!isOrderHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isOrderHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      hydratePayment();
    }
  }, [hydratePayment, isHydrated]);

  useEffect(() => {
    if (checkoutSummary.totalPayable > 0) {
      setBaseAmount(checkoutSummary.totalPayable);
    }
  }, [checkoutSummary.totalPayable, setBaseAmount]);

  const orderSummary = useMemo(() => {
    const primary = cartItems[0];
    if (!primary) {
      return {
        productName: 'Industrial Material',
        grade: '—',
        quantityMt: 0,
        pickupLabel: 'Warehouse Region',
        destinationLabel: `${shippingAddress.warehouseName}, ${shippingAddress.state}`,
        totalAmount: checkoutSummary.totalPayable,
      };
    }

    const totalQty = cartItems.reduce((sum, item) => sum + item.quantityMt, 0);

    return {
      productName: buildBlindProductName(primary.productType, primary.name),
      grade: primary.grade,
      quantityMt: totalQty,
      imageUrl: primary.imageUrl,
      pickupLabel: primary.warehouseRegion,
      destinationLabel: `${shippingAddress.warehouseName}, ${shippingAddress.state}`,
      totalAmount: checkoutSummary.totalPayable,
    };
  }, [
    cartItems,
    checkoutSummary.totalPayable,
    shippingAddress.state,
    shippingAddress.warehouseName,
  ]);

  const selectedMethod = getPaymentMethodById(selectedMethodId);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.CHECKOUT as Href);
  }, [router]);

  const handleHelp = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Payment help',
      text2: 'Choose a method to update discount, interest, and payable amount.',
      visibilityTime: 2400,
    });
  }, []);

  const handleSelect = useCallback(
    (methodId: PaymentMethodId) => {
      selectPayment(methodId);
    },
    [selectPayment],
  );

  const handleCompare = useCallback(() => {
    router.push(ROUTES.CUSTOMER.PAYMENT_COMPARE as Href);
  }, [router]);

  const handleContinue = useCallback(() => {
    const order = buildOrderFromCheckout(cartItems, shippingAddress, payment);
    if (!order) {
      Toast.show({
        type: 'error',
        text1: 'Cart empty',
        text2: 'Add items to your cart before continuing.',
        visibilityTime: 2400,
      });
      return;
    }

    createOrder(order);
    router.push(getRouteAfterPaymentSelection(selectedMethodId));
  }, [cartItems, createOrder, payment, router, selectedMethodId, shippingAddress]);

  return (
    <View className="flex-1 bg-brand-background">
      <PaymentHeader onBackPress={handleBack} onHelpPress={handleHelp} />

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 28 }}
          className="flex-1"
        >
          <View>
            <Typography variant="headingLeft" className="text-[22px] text-brand-heading">
              Choose Payment Method
            </Typography>
            <Typography
              variant="subheadingLeft"
              className="mt-sm text-[14px] leading-[22px] text-brand-body"
            >
              Select the most suitable payment option for this order.
            </Typography>
          </View>

          <View
            className="mt-lg"
            style={{ gap: 12 }}
            accessibilityRole="radiogroup"
            accessibilityLabel="Payment methods"
          >
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                selected={method.id === selectedMethodId}
                onSelect={handleSelect}
              />
            ))}
          </View>

          <View className="mt-lg">
            <Pressable
              onPress={handleCompare}
              accessibilityRole="button"
              accessibilityLabel="Compare payment options"
              className="h-12 flex-row items-center justify-center rounded-xl border border-brand-border bg-brand-white"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <PhoneIcon size={iconSizes.sm} color={brandColors.heading} />
              <Typography variant="roleTitle" className="ml-sm text-[14px] text-brand-heading">
                Compare Payment Options
              </Typography>
            </Pressable>
          </View>

          <View className="mt-lg">
            <PaymentSummaryCard summary={orderSummary} />
          </View>

          <View className="mt-lg">
            <SupportCard />
          </View>
        </ScrollView>

        <StickyPaymentBar
          methodTitle={selectedMethod.title}
          discount={payment.discount}
          payableAmount={payment.payableAmount}
          onContinue={handleContinue}
        />
      </View>
    </View>
  );
});

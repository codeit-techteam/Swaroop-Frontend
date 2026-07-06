import { memo, useCallback, useEffect, useMemo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
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
import { PhoneIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  selectCartItems,
  useCartStore,
} from '@/store/cart-store';
import {
  selectCheckoutAddress,
  useCheckoutStore,
} from '@/store/checkout-store';
import {
  selectPaymentCalculation,
  selectPaymentMethodId,
  usePaymentStore,
} from '@/store/payment-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { PaymentMethodId } from '@/types/payment';

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const buildBlindProductName = (productType: string, name: string): string => {
  const typeLabel = toTitleCase(productType.replace(/_/g, ' '));
  const suffix = name.replace(/^PP\s+[A-Z0-9]+\s*/i, '').trim();
  if (suffix) {
    return `${typeLabel} (PP) ${suffix}`;
  }
  return `${typeLabel} (PP)`;
};

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
  }, [cartItems, checkoutSummary.totalPayable, shippingAddress.state, shippingAddress.warehouseName]);

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
    router.push(ROUTES.CUSTOMER.ORDER_CONFIRMATION as Href);
  }, [router]);

  return (
    <View className="flex-1 bg-brand-background">
      <PaymentHeader onBackPress={handleBack} onHelpPress={handleHelp} />

      <Animated.View entering={FadeIn.duration(260)} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 28 }}
          className="flex-1"
        >
          <Animated.View entering={FadeInDown.duration(320).springify().damping(18)}>
            <Typography variant="headingLeft" className="text-[22px] text-brand-heading">
              Choose Payment Method
            </Typography>
            <Typography
              variant="subheadingLeft"
              className="mt-sm text-[14px] leading-[22px] text-brand-body"
            >
              Select the most suitable payment option for this order.
            </Typography>
          </Animated.View>

          <View
            className="mt-lg"
            style={{ gap: 12 }}
            accessibilityRole="radiogroup"
            accessibilityLabel="Payment methods"
          >
            {PAYMENT_METHODS.map((method, index) => (
              <Animated.View
                key={method.id}
                entering={FadeInDown.delay(40 + index * 40)
                  .duration(320)
                  .springify()
                  .damping(18)}
              >
                <PaymentMethodCard
                  method={method}
                  selected={method.id === selectedMethodId}
                  onSelect={handleSelect}
                />
              </Animated.View>
            ))}
          </View>

          <Animated.View
            entering={FadeInDown.delay(280).duration(320).springify().damping(18)}
            className="mt-lg"
          >
            <Pressable
              onPress={handleCompare}
              accessibilityRole="button"
              accessibilityLabel="Compare payment options"
              className="h-12 flex-row items-center justify-center rounded-xl border border-brand-border bg-brand-white"
            >
              <PhoneIcon size={iconSizes.sm} color={brandColors.heading} />
              <Typography variant="roleTitle" className="ml-sm text-[14px] text-brand-heading">
                Compare Payment Options
              </Typography>
            </Pressable>
          </Animated.View>

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
      </Animated.View>
    </View>
  );
});

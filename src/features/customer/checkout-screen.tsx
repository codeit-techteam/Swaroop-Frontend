import { memo, useCallback, useEffect, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { formatCartCurrency } from '@/constants/cart';
import { formatPricePerKg, getProductDetailsById } from '@/constants/productDetails';
import { ArrowRightIcon, BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectCartItems, selectOrderSummary, useCartStore } from '@/store/cart-store';
import { usePaymentStore } from '@/store/payment-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerCheckoutScreen = memo(function CustomerCheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cartItems = useCartStore(selectCartItems);
  const cartSummary = useCartStore(selectOrderSummary);
  const setBaseAmount = usePaymentStore((state) => state.setBaseAmount);

  const params = useLocalSearchParams<{
    productId?: string | string[];
    quantityMt?: string | string[];
    tierId?: string | string[];
    unitPrice?: string | string[];
  }>();

  const productId = typeof params.productId === 'string' ? params.productId : undefined;
  const quantityMt = typeof params.quantityMt === 'string' ? Number(params.quantityMt) : undefined;
  const unitPrice = typeof params.unitPrice === 'string' ? Number(params.unitPrice) : undefined;

  const product = useMemo(() => (productId ? getProductDetailsById(productId) : null), [productId]);

  const buyNowTotal = useMemo(() => {
    if (!quantityMt || Number.isNaN(quantityMt) || !unitPrice || Number.isNaN(unitPrice)) {
      return 0;
    }
    return Math.round(unitPrice * quantityMt * 1000);
  }, [quantityMt, unitPrice]);

  const orderTotal = cartItems.length > 0 ? cartSummary.totalLandedCost : buyNowTotal;

  useEffect(() => {
    if (orderTotal > 0) {
      setBaseAmount(orderTotal);
    }
  }, [orderTotal, setBaseAmount]);

  const handleContinueToPayment = useCallback(() => {
    if (orderTotal > 0) {
      setBaseAmount(orderTotal);
    }
    router.push(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [orderTotal, router, setBaseAmount]);

  const hasCartItems = cartItems.length > 0;
  const canContinue = orderTotal > 0 || hasCartItems;

  return (
    <View className="flex-1 bg-brand-white px-lg" style={{ paddingTop: insets.top + 16 }}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="h-10 w-10 items-center justify-center"
      >
        <BackArrowIcon color={brandColors.heading} />
      </Pressable>

      <Typography variant="headingLeft" className="mt-lg text-brand-heading">
        Checkout
      </Typography>
      <Typography variant="subheadingLeft" className="mt-sm">
        Review your order, then continue to payment selection. Frontend only — no payment APIs.
      </Typography>

      {product ? (
        <View className="mt-xl rounded-xl border border-brand-border bg-brand-surface p-lg">
          <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
            {product.breadcrumbProduct}
          </Typography>
          <Typography variant="roleDescription" className="mt-sm text-brand-body">
            Grade {product.grade}
          </Typography>
          {quantityMt && !Number.isNaN(quantityMt) ? (
            <Typography variant="roleDescription" className="mt-sm text-brand-body">
              Quantity: {quantityMt} MT
            </Typography>
          ) : null}
          {unitPrice && !Number.isNaN(unitPrice) ? (
            <Typography variant="roleDescription" className="mt-sm text-brand-body">
              Unit Price: {formatPricePerKg(unitPrice)} / KG
            </Typography>
          ) : null}
          {buyNowTotal > 0 ? (
            <Typography variant="roleTitle" className="mt-md text-[15px] text-brand-primary">
              Estimated Total: {formatCartCurrency(buyNowTotal)}
            </Typography>
          ) : null}
        </View>
      ) : null}

      {hasCartItems ? (
        <View className="mt-xl rounded-xl border border-brand-border bg-brand-surface p-lg">
          <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
            Cart Order
          </Typography>
          {cartItems.map((item) => (
            <Typography key={item.id} variant="roleDescription" className="mt-sm text-brand-body">
              {item.name} · {item.quantityMt} MT
            </Typography>
          ))}
          <Typography variant="roleTitle" className="mt-md text-[15px] text-brand-primary">
            Total Payable: {formatCartCurrency(cartSummary.totalLandedCost)}
          </Typography>
        </View>
      ) : null}

      {!product && !hasCartItems ? (
        <View className="mt-xl rounded-xl border border-brand-border bg-brand-surface p-lg">
          <Typography variant="roleDescription" className="text-brand-body">
            Your cart is empty. Add materials from the marketplace to continue.
          </Typography>
        </View>
      ) : null}

      <Pressable
        onPress={handleContinueToPayment}
        disabled={!canContinue}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        accessibilityLabel="Continue to payment selection"
        className={`mt-xl h-12 flex-row items-center justify-center rounded-xl ${
          canContinue ? 'bg-brand-heading' : 'bg-brand-disabled'
        }`}
      >
        <Typography variant="button" className="mr-xs text-[14px] tracking-normal">
          Continue to Payment
        </Typography>
        <ArrowRightIcon size={iconSizes.sm} color={brandColors.white} />
      </Pressable>
    </View>
  );
});

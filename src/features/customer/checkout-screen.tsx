import { memo, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { formatCartCurrency } from '@/constants/cart';
import { formatPricePerKg, getProductDetailsById } from '@/constants/productDetails';
import { BackArrowIcon } from '@/icons';
import { selectCartItems, selectOrderSummary, useCartStore } from '@/store/cart-store';
import { brandColors } from '@/theme/colors';

export const CustomerCheckoutScreen = memo(function CustomerCheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cartItems = useCartStore(selectCartItems);
  const cartSummary = useCartStore(selectOrderSummary);
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

  const hasCartItems = cartItems.length > 0 && !product;

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
        Frontend placeholder only. No payment or order APIs are connected.
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
    </View>
  );
});

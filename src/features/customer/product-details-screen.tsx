import { memo, useMemo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import {
  formatMarketPrice,
  formatMoqLabel,
  formatStockLabel,
  getMarketProductById,
  getStockLevel,
} from '@/constants/marketProducts';
import { BackArrowIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { MarketAvailabilityBadge, MarketCategory, MarketProduct } from '@/types/market';
import { cn } from '@/utils/cn';

const STOCK_TEXT_CLASS = {
  high: 'text-brand-success',
  medium: 'text-warning',
  low: 'text-brand-error',
} as const;

const parseProductParams = (
  params: Record<string, string | string[] | undefined>,
): MarketProduct | null => {
  const id = typeof params.id === 'string' ? params.id : undefined;

  if (!id) {
    return null;
  }

  const fromMock = getMarketProductById(id);
  if (fromMock) {
    return fromMock;
  }

  const name = typeof params.name === 'string' ? params.name : null;
  const grade = typeof params.grade === 'string' ? params.grade : null;
  const price = typeof params.price === 'string' ? Number(params.price) : NaN;
  const origin = typeof params.origin === 'string' ? params.origin : null;
  const stock = typeof params.stock === 'string' ? Number(params.stock) : NaN;
  const moq = typeof params.moq === 'string' ? Number(params.moq) : NaN;
  const eta = typeof params.eta === 'string' ? params.eta : null;
  const category = typeof params.category === 'string' ? params.category : null;
  const badge = typeof params.badge === 'string' ? params.badge : null;
  const image = typeof params.image === 'string' ? params.image : '';

  if (
    !name ||
    !grade ||
    !origin ||
    !eta ||
    !category ||
    !badge ||
    Number.isNaN(price) ||
    Number.isNaN(stock) ||
    Number.isNaN(moq)
  ) {
    return null;
  }

  return {
    id,
    name,
    grade,
    price,
    origin,
    stock,
    moq,
    eta,
    category: category as MarketCategory,
    badge: badge as MarketAvailabilityBadge,
    image,
  };
};

export const CustomerProductDetailsScreen = memo(function CustomerProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const product = useMemo(() => parseProductParams(params), [params]);

  if (!product) {
    return (
      <View className="flex-1 bg-brand-white px-lg" style={{ paddingTop: insets.top + 16 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <BackArrowIcon color={brandColors.primary} />
        </Pressable>
        <Typography variant="headingLeft" className="mt-lg text-brand-heading">
          Product not found
        </Typography>
        <Typography variant="subheadingLeft" className="mt-sm">
          Return to the marketplace and select a material grade.
        </Typography>
      </View>
    );
  }

  const stockLevel = getStockLevel(product.stock);

  return (
    <View className="flex-1 bg-brand-white">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-sm h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.primary} />
          </Pressable>
          <Typography variant="roleTitle" className="flex-1 text-[16px] text-brand-heading">
            Product Details
          </Typography>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        className="flex-1"
      >
        <View className="mx-lg mt-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm">
          <View className="flex-row items-start justify-between">
            <View className="rounded-md bg-brand-primary-light px-sm py-xs">
              <Typography variant="badge" className="text-[10px] text-brand-badge-text">
                {product.grade}
              </Typography>
            </View>
            <View className="items-end">
              <Typography
                variant="headingLeft"
                className="text-[22px] leading-[28px] text-brand-primary"
              >
                {formatMarketPrice(product.price)}
              </Typography>
              <Typography
                variant="caption"
                className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
              >
                per MT
              </Typography>
            </View>
          </View>

          <Typography variant="headingLeft" className="mt-md text-[20px] text-brand-primary">
            {product.name}
          </Typography>

          <View className="mt-sm self-start rounded-md bg-brand-primary-light px-sm py-xs">
            <Typography variant="badge" className="text-[10px] text-brand-primary-dark">
              {product.badge}
            </Typography>
          </View>

          <View className="mt-lg flex-row">
            <View className="flex-1">
              <Typography
                variant="fieldLabel"
                className="text-[10px] tracking-[0.8px] text-brand-muted"
              >
                Origin
              </Typography>
              <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
                {product.origin}
              </Typography>
            </View>
            <View className="flex-1 items-center">
              <Typography
                variant="fieldLabel"
                className="text-[10px] tracking-[0.8px] text-brand-muted"
              >
                MOQ
              </Typography>
              <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
                {formatMoqLabel(product.moq)}
              </Typography>
            </View>
            <View className="flex-1 items-end">
              <Typography
                variant="fieldLabel"
                className="text-[10px] tracking-[0.8px] text-brand-muted"
              >
                Stock
              </Typography>
              <Typography
                variant="roleTitle"
                className={cn('mt-xs text-[14px]', STOCK_TEXT_CLASS[stockLevel])}
              >
                {formatStockLabel(product.stock)}
              </Typography>
            </View>
          </View>

          <View className="mt-lg flex-row items-center gap-xs">
            <TruckIcon size={iconSizes.sm} color={brandColors.muted} />
            <Typography
              variant="caption"
              className="font-sans text-[13px] normal-case tracking-normal text-brand-muted"
            >
              ETA: {product.eta}
            </Typography>
          </View>

          <View className="mt-lg rounded-lg bg-brand-primary-tint px-md py-md">
            <Typography variant="roleDescription" className="text-brand-body">
              Blind marketplace listing. Seller identity is withheld until booking confirmation.
            </Typography>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

import { memo, useCallback, type ReactElement } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import {
  formatMarketPrice,
  formatMoqLabel,
  formatStockLabel,
  getStockLevel,
} from '@/constants/marketProducts';
import { CurrencyIcon, LightningIcon, StarBadgeIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { MarketAvailabilityBadge, MarketProduct, StockLevel } from '@/types/market';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const STOCK_TEXT_CLASS: Record<StockLevel, string> = {
  high: 'text-brand-success',
  medium: 'text-warning',
  low: 'text-brand-error',
};

const GRADE_BADGE_CLASS: Record<string, string> = {
  PP: 'bg-brand-primary-light',
  HDPE: 'bg-brand-primary-light',
  PVC: 'bg-[#FFF4E5]',
  LLDPE: 'bg-brand-primary-light',
  PET: 'bg-brand-primary-light',
  PC: 'bg-brand-primary-light',
  ABS: 'bg-brand-primary-light',
  EVA: 'bg-brand-primary-light',
};

const GRADE_TEXT_CLASS: Record<string, string> = {
  PP: 'text-brand-badge-text',
  HDPE: 'text-brand-badge-text',
  PVC: 'text-[#B45309]',
  LLDPE: 'text-brand-badge-text',
  PET: 'text-brand-badge-text',
  PC: 'text-brand-badge-text',
  ABS: 'text-brand-badge-text',
  EVA: 'text-brand-badge-text',
};

type BadgeStyle = {
  container: string;
  text: string;
  icon: ReactElement;
};

const BADGE_STYLES: Record<MarketAvailabilityBadge, BadgeStyle> = {
  'Fastest Delivery': {
    container: 'bg-brand-primary-light',
    text: 'text-brand-primary-dark',
    icon: <LightningIcon size={12} color={brandColors.primaryDark} />,
  },
  'Lowest Cost': {
    container: 'bg-brand-success-light',
    text: 'text-brand-success',
    icon: <CurrencyIcon size={12} color={brandColors.success} />,
  },
  'Premium Grade': {
    container: 'bg-brand-overlay',
    text: 'text-brand-body',
    icon: <StarBadgeIcon size={12} color={brandColors.body} />,
  },
  'Best Value': {
    container: 'bg-brand-primary-light',
    text: 'text-brand-primary-dark',
    icon: <StarBadgeIcon size={12} color={brandColors.primaryDark} />,
  },
  'High Demand': {
    container: 'bg-[#FFF4E5]',
    text: 'text-[#B45309]',
    icon: <LightningIcon size={12} color="#B45309" />,
  },
  'Limited Stock': {
    container: 'bg-brand-error-light',
    text: 'text-brand-error',
    icon: <StarBadgeIcon size={12} color={brandColors.error} />,
  },
};

type ProductCardProps = {
  product: MarketProduct;
  index: number;
  onBookNow: (product: MarketProduct) => void;
  className?: string;
};

export const ProductCard = memo(function ProductCard({
  product,
  index,
  onBookNow,
  className,
}: ProductCardProps) {
  const scale = useSharedValue(1);
  const stockLevel = getStockLevel(product.stock);
  const badgeStyle = BADGE_STYLES[product.badge];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleBookNow = useCallback(() => {
    onBookNow(product);
  }, [onBookNow, product]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .duration(360)
        .springify()
        .damping(18)}
      className={cn('mx-lg mb-md', className)}
      style={animatedStyle}
    >
      <View className="rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm">
        <View className="flex-row items-start justify-between">
          <View
            className={cn(
              'rounded-md px-sm py-xs',
              GRADE_BADGE_CLASS[product.grade] ?? 'bg-brand-primary-light',
            )}
          >
            <Typography
              variant="badge"
              className={cn(
                'text-[10px] tracking-[0.6px]',
                GRADE_TEXT_CLASS[product.grade] ?? 'text-brand-badge-text',
              )}
            >
              {product.grade}
            </Typography>
          </View>

          <View className="items-end">
            <Typography
              variant="headingLeft"
              className="text-[20px] leading-[24px] text-brand-primary"
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

        <Typography
          variant="roleTitle"
          className="mt-sm text-[16px] text-brand-primary"
          numberOfLines={2}
        >
          {product.name}
        </Typography>

        <View
          className={cn(
            'mt-sm flex-row items-center self-start rounded-md px-sm py-xs',
            badgeStyle.container,
          )}
        >
          {badgeStyle.icon}
          <Typography
            variant="badge"
            className={cn('ml-xs text-[10px] tracking-[0.6px]', badgeStyle.text)}
          >
            {product.badge}
          </Typography>
        </View>

        <View className="mt-md flex-row">
          <View className="flex-1">
            <Typography
              variant="fieldLabel"
              className="text-[10px] tracking-[0.8px] text-brand-muted"
            >
              Origin
            </Typography>
            <Typography
              variant="roleTitle"
              className="mt-xs text-[13px] text-brand-heading"
              numberOfLines={1}
            >
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
            <Typography variant="roleTitle" className="mt-xs text-[13px] text-brand-heading">
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
              className={cn('mt-xs text-[13px]', STOCK_TEXT_CLASS[stockLevel])}
            >
              {formatStockLabel(product.stock)}
            </Typography>
          </View>
        </View>

        <View className="mt-md flex-row items-center justify-between">
          <View className="flex-row items-center gap-xs">
            <TruckIcon size={iconSizes.sm} color={brandColors.muted} />
            <Typography
              variant="caption"
              className="font-sans text-[12px] normal-case tracking-normal text-brand-muted"
            >
              ETA: {product.eta}
            </Typography>
          </View>

          <AnimatedPressable
            onPress={handleBookNow}
            onPressIn={() => {
              scale.value = withSpring(0.985, { damping: 16, stiffness: 320 });
            }}
            onPressOut={() => {
              scale.value = withSpring(1, { damping: 16, stiffness: 320 });
            }}
            accessibilityRole="button"
            accessibilityLabel={`Book ${product.name}`}
            className="rounded-lg bg-brand-primary px-lg py-sm"
          >
            <Typography variant="button" className="text-[13px] tracking-normal">
              Book Now
            </Typography>
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
});

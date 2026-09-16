import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { TrashIcon } from '@/icons';
import type { OfferPricingTier } from '@/seller/modules/seller-offers/types/offers';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const formatKgPrice = (value: number): string =>
  `₹${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}`;

export const OfferTierCard = memo(function OfferTierCard({
  tier,
  basePrice,
  onDelete,
  showDelete = true,
}: {
  tier: OfferPricingTier;
  basePrice: number;
  onDelete?: () => void;
  showDelete?: boolean;
}) {
  const savings =
    basePrice > 0 ? Number((((basePrice - tier.pricePerKg) / basePrice) * 100).toFixed(1)) : 0;

  return (
    <View className="mb-sm flex-row items-center rounded-xl bg-brand-surface px-md py-md">
      <Typography variant="roleDescription" className="flex-1">
        {tier.label}
      </Typography>
      <View className="items-center px-md">
        <Typography variant="roleTitle">{formatKgPrice(tier.pricePerKg)}/kg</Typography>
        {savings > 0 ? (
          <Typography variant="legal" className="text-brand-success">
            {savings}% Off
          </Typography>
        ) : null}
      </View>
      {showDelete && onDelete ? (
        <Pressable onPress={onDelete} className="p-sm">
          <TrashIcon size={16} color={brandColors.error} />
        </Pressable>
      ) : (
        <View className="w-8" />
      )}
    </View>
  );
});

export const OfferTierList = memo(function OfferTierList({
  tiers,
  highlightLast = false,
  compact = false,
  showHeader = true,
}: {
  tiers: OfferPricingTier[];
  highlightLast?: boolean;
  compact?: boolean;
  showHeader?: boolean;
}) {
  if (tiers.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <View className="flex-row flex-wrap gap-xs">
        {tiers.map((tier, index) => {
          const highlighted = highlightLast && index === tiers.length - 1;
          return (
            <View
              key={tier.id}
              className={cn(
                'flex-row items-center rounded-full px-sm py-xs',
                highlighted ? 'bg-brand-navy' : 'bg-brand-surface',
              )}
            >
              <Typography
                variant="badge"
                className={cn('text-[10px]', highlighted ? 'text-brand-white/80' : 'text-brand-body')}
              >
                {tier.label}
              </Typography>
              <Typography
                variant="badge"
                className={cn('ml-xs text-[11px]', highlighted ? 'text-brand-white' : 'text-brand-heading')}
              >
                {formatKgPrice(tier.pricePerKg)}
              </Typography>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View className={cn(showHeader ? 'px-md py-md' : 'pt-sm')}>
      {showHeader ? (
        <Typography variant="badge" className="mb-sm text-[11px] tracking-[0.8px] text-brand-body">
          BULK TIERS
        </Typography>
      ) : null}
      {tiers.map((tier, index) => {
        const highlighted = highlightLast && index === tiers.length - 1;
        return (
          <View
            key={tier.id}
            className={cn(
              'mb-xs flex-row items-center justify-between rounded-xl px-md py-sm',
              highlighted ? 'bg-brand-primary-tint' : 'bg-brand-surface',
            )}
          >
            <Typography variant="roleDescription">{tier.label}</Typography>
            <Typography
              variant="roleTitle"
              className={highlighted ? 'text-brand-navy' : 'text-brand-heading'}
            >
              {formatKgPrice(tier.pricePerKg)}/kg
            </Typography>
          </View>
        );
      })}
    </View>
  );
});

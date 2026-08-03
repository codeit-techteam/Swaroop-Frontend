import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { TrashIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { OfferPricingTier } from '@/seller/modules/seller-offers/types/offers';

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
        <Typography variant="roleTitle">₹{tier.pricePerKg}/kg</Typography>
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
}: {
  tiers: OfferPricingTier[];
  highlightLast?: boolean;
}) {
  return (
    <View className="border-t border-brand-border px-md py-md">
      <Typography variant="badge" className="mb-sm text-[11px] text-brand-body">
        BULK TIERS
      </Typography>
      {tiers.map((tier, index) => {
        const highlighted = highlightLast && index === tiers.length - 1;
        return (
          <View
            key={tier.id}
            className="mb-xs flex-row items-center justify-between rounded-lg bg-brand-surface px-md py-sm"
          >
            <Typography variant="roleDescription">{tier.label}</Typography>
            <Typography
              variant="roleTitle"
              className={highlighted ? 'text-brand-navy' : 'text-brand-heading'}
            >
              ₹{tier.pricePerKg}/kg
            </Typography>
          </View>
        );
      })}
    </View>
  );
});

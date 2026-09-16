import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr } from '@/constants/productDetails';
import type { PricingTier } from '@/types/product';
import { cn } from '@/utils/cn';

type PricingTiersCardProps = {
  tiers: PricingTier[];
  selectedTierId: string;
  onSelectTier: (tierId: string) => void;
  className?: string;
};

type TierRowProps = {
  tier: PricingTier;
  selected: boolean;
  onPress: (tierId: string) => void;
};

const TierSelectCard = memo(function TierSelectCard({ tier, selected, onPress }: TierRowProps) {
  return (
    <Pressable
      onPress={() => onPress(tier.id)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${tier.quantityLabel}, ${formatInr(tier.pricePerMt)} per MT`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      className={cn(
        'flex-row items-center rounded-lg px-md py-md',
        selected ? 'bg-brand-primary-tint' : 'bg-transparent',
      )}
    >
      <View
        className={cn(
          'h-3.5 w-3.5 items-center justify-center rounded-full border',
          selected ? 'border-brand-heading bg-brand-heading' : 'border-brand-border bg-brand-white',
        )}
      >
        {selected ? <View className="h-1.5 w-1.5 rounded-full bg-brand-white" /> : null}
      </View>
      <View className="ml-sm min-w-0 flex-1">
        <Typography variant="roleTitle" className="text-[13px] text-brand-body">
          {tier.quantityLabel}
        </Typography>
        {tier.savingsLabel ? (
          <Typography variant="success" className="mt-0.5 text-[11px]">
            {tier.savingsLabel}
          </Typography>
        ) : null}
      </View>
      <Typography variant="roleTitle" className="text-[13px] text-brand-primary">
        {formatInr(tier.pricePerMt)}
      </Typography>
    </Pressable>
  );
});

export const PricingTiersCard = memo(function PricingTiersCard({
  tiers,
  selectedTierId,
  onSelectTier,
  className,
}: PricingTiersCardProps) {
  const handleSelect = useCallback(
    (tierId: string) => {
      onSelectTier(tierId);
    },
    [onSelectTier],
  );

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="flex-row items-start justify-between">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
          Bulk Pricing
        </Typography>
        <Typography
          variant="caption"
          className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
        >
          Select a tier
        </Typography>
      </View>

      <View className="mt-sm">
        {tiers.map((tier) => (
          <TierSelectCard
            key={tier.id}
            tier={tier}
            selected={tier.id === selectedTierId}
            onPress={handleSelect}
          />
        ))}
      </View>
    </View>
  );
});

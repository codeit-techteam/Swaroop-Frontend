import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { InfoIcon } from '@/icons';
import { iconSizes } from '@/theme/icons';
import type { PricingTier } from '@/types/product';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PricingTiersCardProps = {
  tiers: PricingTier[];
  selectedTierId: string;
  procurementTerms: string[];
  onSelectTier: (tierId: string) => void;
  className?: string;
};

const formatTierPrice = (price: number): string => {
  const hasDecimals = price % 1 !== 0;
  return `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

type TierRowProps = {
  tier: PricingTier;
  selected: boolean;
  onPress: (tierId: string) => void;
};

const TierSelectCard = memo(function TierSelectCard({ tier, selected, onPress }: TierRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => onPress(tier.id)}
      onPressIn={() => {
        scale.value = withSpring(0.985, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${tier.quantityLabel}, ${tier.rateLabel}, ${formatTierPrice(tier.unitPrice)}`}
      style={animatedStyle}
      className={cn(
        'flex-row items-center justify-between rounded-lg border bg-brand-white px-md py-md',
        selected ? 'border-brand-heading' : 'border-brand-border',
      )}
    >
      <View className="flex-1 pr-sm">
        <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
          {tier.quantityLabel}
        </Typography>
        <Typography
          variant="caption"
          className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          {tier.rateLabel}
        </Typography>
        {tier.savingsLabel ? (
          <Typography variant="success" className="mt-xs text-[11px]">
            {tier.savingsLabel}
          </Typography>
        ) : null}
      </View>
      <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
        {formatTierPrice(tier.unitPrice)}
      </Typography>
    </AnimatedPressable>
  );
});

export const PricingTiersCard = memo(function PricingTiersCard({
  tiers,
  selectedTierId,
  procurementTerms,
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
    <Animated.View
      entering={FadeInDown.delay(200).duration(360).springify().damping(18)}
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
        Bulk Pricing Tiers
      </Typography>

      <View className="mt-md overflow-hidden rounded-lg border border-brand-border">
        <View className="flex-row bg-brand-surface px-md py-sm">
          <Typography
            variant="fieldLabel"
            className="flex-1 text-[10px] tracking-[0.6px] text-brand-muted"
          >
            Quantity (MT)
          </Typography>
          <Typography
            variant="fieldLabel"
            className="flex-1 text-center text-[10px] tracking-[0.6px] text-brand-muted"
          >
            Unit Price (₹/KG)
          </Typography>
          <Typography
            variant="fieldLabel"
            className="flex-1 text-right text-[10px] tracking-[0.6px] text-brand-muted"
          >
            Total (Est)
          </Typography>
        </View>

        {tiers.map((tier, index) => {
          const selected = tier.id === selectedTierId;
          return (
            <View
              key={tier.id}
              className={cn(
                'flex-row items-center px-md py-md',
                index % 2 === 0 ? 'bg-brand-white' : 'bg-brand-surface/60',
                selected && 'bg-brand-primary-tint',
              )}
            >
              <Typography
                variant="roleTitle"
                className={cn(
                  'flex-1 text-[13px]',
                  selected ? 'text-brand-heading' : 'font-medium text-brand-body',
                )}
              >
                {tier.quantityLabel}
              </Typography>
              <Typography
                variant="roleTitle"
                className={cn(
                  'flex-1 text-center text-[13px]',
                  selected ? 'text-brand-heading' : 'font-medium text-brand-body',
                )}
              >
                {formatTierPrice(tier.unitPrice)}
              </Typography>
              <Typography
                variant="roleTitle"
                className={cn(
                  'flex-1 text-right text-[13px]',
                  selected ? 'text-brand-heading' : 'font-medium text-brand-body',
                )}
              >
                {tier.totalEstimate}
              </Typography>
            </View>
          );
        })}
      </View>

      <View className="mt-md" style={{ gap: 10 }}>
        {tiers.map((tier) => (
          <TierSelectCard
            key={tier.id}
            tier={tier}
            selected={tier.id === selectedTierId}
            onPress={handleSelect}
          />
        ))}
      </View>

      <View className="mt-md rounded-lg border border-[#F6D5B8] bg-[#FFF7ED] px-md py-md">
        <View className="mb-sm flex-row items-center">
          <InfoIcon size={iconSizes.sm} color="#9A3412" />
          <Typography variant="roleTitle" className="ml-sm text-[14px] text-[#9A3412]">
            Procurement Terms
          </Typography>
        </View>
        {procurementTerms.map((term) => (
          <Typography
            key={term}
            variant="roleDescription"
            className="mb-xs text-[13px] leading-[20px] text-[#9A3412]"
          >
            • {term}
          </Typography>
        ))}
      </View>
    </Animated.View>
  );
});

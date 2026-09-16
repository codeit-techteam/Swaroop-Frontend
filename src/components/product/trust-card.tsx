import { memo } from 'react';

import { Text, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ProductDetails } from '@/types/product';
import { cn } from '@/utils/cn';

type TrustCardProps = {
  product: ProductDetails;
  className?: string;
};

export const TrustCard = memo(function TrustCard({ product, className }: TrustCardProps) {
  const highlightIndex = product.trustDescription.indexOf(product.trustHighlight);
  const hasHighlight = highlightIndex >= 0;
  const before = hasHighlight
    ? product.trustDescription.slice(0, highlightIndex)
    : product.trustDescription;
  const after = hasHighlight
    ? product.trustDescription.slice(highlightIndex + product.trustHighlight.length)
    : '';

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="flex-row items-center">
        <ShieldCheckIcon size={iconSizes.md} color={brandColors.heading} />
        <Typography variant="roleTitle" className="ml-sm text-[16px] text-brand-heading">
          {product.trustTitle}
        </Typography>
      </View>

      <Text className="mt-md font-sans text-[13px] leading-[20px] text-brand-body">
        {before}
        {hasHighlight ? (
          <Text className="font-bold text-[13px] leading-[20px] text-brand-heading">
            {product.trustHighlight}
          </Text>
        ) : null}
        {after}
      </Text>

      <View className="mt-md" style={{ gap: 14 }}>
        {product.trustFeatures.map((feature) => (
          <View key={feature.id} className="flex-row items-start">
            <View className="mt-0.5">
              {feature.icon === 'shield' ? (
                <ShieldCheckIcon size={iconSizes.md} color={brandColors.primaryDark} />
              ) : (
                <CheckCircleIcon size={iconSizes.md} color={brandColors.primaryDark} />
              )}
            </View>
            <View className="ml-sm flex-1">
              <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                {feature.title}
              </Typography>
              <Typography
                variant="caption"
                className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
              >
                {feature.description}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

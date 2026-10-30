import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ProductDetails } from '@/types/product';
import { cn } from '@/utils/cn';

type TrustCardProps = {
  product: ProductDetails;
  className?: string;
};

export const TrustCard = memo(function TrustCard({ product, className }: TrustCardProps) {
  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="flex-row items-start">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-tint">
          <ShieldCheckIcon size={iconSizes.md} color={brandColors.heading} />
        </View>
        <View className="ml-sm flex-1">
          <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
            {product.trustTitle}
          </Typography>
          <Typography
            variant="caption"
            className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
          >
            Built for trusted industrial procurement
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row flex-wrap" style={{ gap: 10 }}>
        {product.trustFeatures.map((feature) => (
          <View
            key={feature.id}
            className="min-w-[46%] flex-1 rounded-lg bg-brand-surface px-md py-md"
            style={{ flexBasis: '46%' }}
          >
            <View className="flex-row items-center">
              <ShieldCheckIcon size={iconSizes.sm} color={brandColors.primary} />
              <Typography
                variant="roleTitle"
                className="ml-xs flex-1 text-[13px] text-brand-heading"
                numberOfLines={2}
              >
                {feature.title}
              </Typography>
            </View>
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[11px] normal-case leading-[15px] tracking-normal text-brand-muted"
            >
              {feature.description}
            </Typography>
            <Typography
              variant="fieldLabel"
              className="mt-xs text-[9px] tracking-[0.6px] text-brand-muted"
            >
              {feature.statusLabel}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});

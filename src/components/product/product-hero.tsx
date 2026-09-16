import { memo } from 'react';

import { View } from 'react-native';

import { BlindSellerBadge } from '@/components/product/blind-seller-badge';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type ProductHeroProps = {
  grade: string;
  sku?: string;
  accessibilityLabel?: string;
  className?: string;
};

export const ProductHero = memo(function ProductHero({
  grade,
  sku,
  accessibilityLabel = 'Material grade',
  className,
}: ProductHeroProps) {
  return (
    <View
      className={cn(
        'mx-lg flex-row items-center rounded-xl border border-brand-border bg-brand-white p-lg',
        className,
      )}
      accessibilityLabel={accessibilityLabel}
    >
      <View className="h-16 w-16 items-center justify-center rounded-xl border border-brand-border bg-brand-surface">
        <Typography variant="roleTitle" className="text-[15px] text-brand-primary">
          {grade.slice(0, 4).toUpperCase()}
        </Typography>
      </View>
      <View className="ml-md flex-1">
        <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
          Blind Marketplace Offer
        </Typography>
        <Typography
          variant="caption"
          className="mt-xs font-sans text-[12px] normal-case leading-[16px] tracking-normal text-brand-body"
        >
          Commercial and technical data only — no product photography and no seller identity during
          discovery.
        </Typography>
        {sku ? (
          <Typography variant="roleTitle" className="mt-xs text-[12px] text-brand-heading">
            {sku}
          </Typography>
        ) : null}
        <BlindSellerBadge className="mt-sm" />
      </View>
    </View>
  );
});

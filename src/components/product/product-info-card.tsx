import { memo, useState } from 'react';

import { Pressable, View } from 'react-native';

import { BlindSellerBadge } from '@/components/product/blind-seller-badge';
import { Typography } from '@/components/ui/typography';
import type { ProductAvailabilityLevel, ProductDetails } from '@/types/product';
import { cn } from '@/utils/cn';

type ProductInfoCardProps = {
  product: ProductDetails;
  className?: string;
};

const DESCRIPTION_PREVIEW_CHARS = 180;

const AVAILABILITY_BADGE_CLASS: Record<ProductAvailabilityLevel, string> = {
  high: 'bg-brand-success-light',
  medium: 'bg-brand-success-light',
  limited: 'bg-[#FFF4E5]',
  out_of_stock: 'bg-brand-error-light',
};

const AVAILABILITY_TEXT_CLASS: Record<ProductAvailabilityLevel, string> = {
  high: 'text-brand-success',
  medium: 'text-brand-success',
  limited: 'text-[#B45309]',
  out_of_stock: 'text-brand-error',
};

export const ProductInfoCard = memo(function ProductInfoCard({
  product,
  className,
}: ProductInfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = product.description.length > DESCRIPTION_PREVIEW_CHARS;
  const description =
    !needsTruncate || expanded
      ? product.description
      : `${product.description.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd()}…`;

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="flex-row flex-wrap items-center" style={{ gap: 8 }}>
        <View
          className={cn(
            'self-start rounded-md px-sm py-xs',
            AVAILABILITY_BADGE_CLASS[product.availability],
          )}
        >
          <Typography
            variant="badge"
            className={cn(
              'text-[10px] tracking-[0.6px]',
              AVAILABILITY_TEXT_CLASS[product.availability],
            )}
          >
            {product.availabilityLabel}
          </Typography>
        </View>
        <View className="self-start rounded-md bg-brand-success-light px-sm py-xs">
          <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-success">
            Verified Supply
          </Typography>
        </View>
        <View className="self-start rounded-md bg-brand-surface px-sm py-xs">
          <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-heading">
            {product.grade}
          </Typography>
        </View>
        {product.sku ? (
          <Typography
            variant="caption"
            className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
          >
            {product.sku}
          </Typography>
        ) : null}
      </View>

      <Typography
        variant="headingLeft"
        className="mt-md text-[22px] leading-[28px] text-brand-heading"
      >
        {product.name}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs text-[14px] text-brand-body">
        {product.materialType} · Category: {product.categoryName}
      </Typography>

      <BlindSellerBadge className="mt-sm" />

      {product.description ? (
        <View className="mt-sm">
          <Typography
            variant="caption"
            className="font-sans text-[13px] normal-case leading-[18px] tracking-normal text-brand-body"
          >
            {description}
          </Typography>
          {needsTruncate ? (
            <Pressable
              onPress={() => setExpanded((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={expanded ? 'Show less description' : 'Read more description'}
              className="mt-xs self-start"
            >
              <Typography variant="link" className="text-[13px] text-brand-primary">
                {expanded ? 'Show Less' : 'Read More'}
              </Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatInr } from '@/constants/productDetails';
import { LockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { RelatedProductCard } from '@/types/product';
import { cn } from '@/utils/cn';

type RelatedProductsProps = {
  products: RelatedProductCard[];
  onSelect: (productId: string) => void;
  className?: string;
};

export const RelatedProducts = memo(function RelatedProducts({
  products,
  onSelect,
  className,
}: RelatedProductsProps) {
  const handleSelect = useCallback(
    (productId: string) => {
      onSelect(productId);
    },
    [onSelect],
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <View className={cn('mb-sm', className)}>
      <View className="px-lg">
        <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
          Recommended Grades
        </Typography>
        <Typography
          variant="caption"
          className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          Similar materials by specification and commercial terms.
        </Typography>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}
      >
        {products.map((product) => (
          <View
            key={product.id}
            className="mr-md w-[240px] rounded-xl border border-brand-border bg-brand-white p-md shadow-sm"
          >
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-lg border border-brand-border bg-brand-surface">
                <Typography variant="roleTitle" className="text-[11px] text-brand-primary">
                  {product.name.slice(0, 3).toUpperCase()}
                </Typography>
              </View>
              <View className="ml-sm min-w-0 flex-1">
                <Typography
                  variant="roleTitle"
                  className="text-[13px] text-brand-heading"
                  numberOfLines={1}
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="caption"
                  className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                >
                  {product.categoryLabel}
                </Typography>
              </View>
            </View>
            <Typography variant="roleTitle" className="mt-md text-[16px] text-brand-primary">
              {formatInr(product.pricePerMt)}
              <Typography
                variant="caption"
                className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
              >
                {' '}
                / MT
              </Typography>
            </Typography>
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
              numberOfLines={1}
            >
              {product.stockLabel} · {product.warehouseLabel}
            </Typography>
            <View className="mt-sm flex-row items-center">
              <LockIcon size={11} color={brandColors.muted} />
              <Typography
                variant="caption"
                className="ml-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
              >
                Seller protected
              </Typography>
            </View>
            <Pressable
              onPress={() => handleSelect(product.id)}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${product.name}`}
              className="mt-md h-9 items-center justify-center rounded-lg bg-brand-primary"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Typography variant="button" className="text-[12px] tracking-normal">
                View Details
              </Typography>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

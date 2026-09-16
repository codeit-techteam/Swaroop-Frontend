import { memo, useState } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { BarChartIcon, ChevronDownIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ProductDetails } from '@/types/product';
import { cn } from '@/utils/cn';

type ProductSpecsProps = {
  product: ProductDetails;
  className?: string;
};

export const ProductSpecs = memo(function ProductSpecs({ product, className }: ProductSpecsProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View
      className={cn(
        'mx-lg overflow-hidden rounded-xl border border-brand-border bg-brand-white shadow-sm',
        className,
      )}
    >
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel="Technical specifications"
        className="flex-row items-center px-lg py-md"
      >
        <View className="mr-sm h-7 w-7 items-center justify-center rounded-md bg-brand-primary-light">
          <BarChartIcon size={iconSizes.sm} color={brandColors.heading} />
        </View>
        <Typography variant="roleTitle" className="flex-1 text-[16px] text-brand-heading">
          Technical Specifications
        </Typography>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <ChevronDownIcon size={16} color={brandColors.muted} />
        </View>
      </Pressable>

      {expanded ? (
        <View className="border-t border-brand-border px-lg pb-lg pt-md">
          <View className="overflow-hidden rounded-lg border border-brand-border">
            {product.specs.map((spec, index) => (
              <View
                key={spec.id}
                className={cn(
                  'flex-row items-center justify-between px-md py-md',
                  index % 2 === 0 ? 'bg-brand-white' : 'bg-brand-surface',
                )}
              >
                <View className="mr-sm flex-1">
                  <Typography variant="roleTitle" className="text-[13px] text-brand-body">
                    {spec.label}
                  </Typography>
                  {spec.standard ? (
                    <Typography
                      variant="caption"
                      className="mt-0.5 font-sans text-[10px] normal-case tracking-normal text-brand-muted"
                    >
                      {spec.standard}
                    </Typography>
                  ) : null}
                </View>
                <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
                  {spec.value}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
});

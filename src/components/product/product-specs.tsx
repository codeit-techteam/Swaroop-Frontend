import { memo } from 'react';

import { View } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { ApplicationCard } from '@/components/product/application-card';
import { Typography } from '@/components/ui/typography';
import { BarChartIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ProductDetails } from '@/types/product';
import { cn } from '@/utils/cn';

type ProductSpecsProps = {
  product: ProductDetails;
  className?: string;
};

export const ProductSpecs = memo(function ProductSpecs({
  product,
  className,
}: ProductSpecsProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(160).duration(360).springify().damping(18)}
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <View className="flex-row items-center">
        <View className="mr-sm h-7 w-7 items-center justify-center rounded-md bg-brand-primary-light">
          <BarChartIcon size={iconSizes.sm} color={brandColors.heading} />
        </View>
        <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
          Technical Grid
        </Typography>
      </View>

      <View className="my-md h-px bg-brand-border" />

      <View style={{ gap: 10 }}>
        {product.specs.map((spec) => (
          <View key={spec.id} className="rounded-lg bg-brand-surface px-md py-md">
            <Typography
              variant="fieldLabel"
              className="text-[10px] tracking-[0.8px] text-brand-muted"
            >
              {spec.label}
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-[16px] text-brand-heading">
              {spec.value}
            </Typography>
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
            >
              {spec.standard}
            </Typography>
          </View>
        ))}
      </View>

      <ApplicationCard
        note={product.applicationNote}
        applications={product.applications}
        className="mt-md"
      />
    </Animated.View>
  );
});

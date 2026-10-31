import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { TrendingProduct } from '@/types/home';
import { cn } from '@/utils/cn';

type TrendingMaterialCardProps = {
  product: TrendingProduct;
  onPress?: (product: TrendingProduct) => void;
  className?: string;
};

function gradeInitials(grade: string, name: string) {
  const source = (grade || name).replace(/[^A-Za-z0-9]/g, '');
  return source.slice(0, 3).toUpperCase() || 'MT';
}

export const TrendingMaterialCard = memo(function TrendingMaterialCard({
  product,
  onPress,
  className,
}: TrendingMaterialCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, grade ${product.grade}, ${product.priceLabel}`}
      className={cn(
        'mr-md h-[156px] w-[168px] rounded-xl border border-brand-border/50 bg-brand-white p-md shadow-sm',
        className,
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="h-10 w-10 items-center justify-center rounded-lg border border-brand-border bg-brand-primary-light">
        <Typography variant="badge" className="text-[11px] tracking-[0.4px] text-brand-primary">
          {gradeInitials(product.grade, product.name)}
        </Typography>
      </View>

      <View className="mt-sm flex-1 justify-between">
        <View>
          <Typography
            variant="roleTitle"
            className="h-[36px] text-[13px] leading-[18px] text-brand-primary"
            numberOfLines={2}
          >
            {product.name}
          </Typography>
          <Typography
            variant="caption"
            className="mt-xs text-left font-sans text-[11px] normal-case tracking-normal text-brand-muted"
            numberOfLines={1}
          >
            Grade {product.grade}
          </Typography>
        </View>

        <Typography
          variant="caption"
          className="text-left font-semibold text-[13px] normal-case tracking-normal text-brand-primary"
          numberOfLines={1}
        >
          {product.priceLabel}
        </Typography>
      </View>
    </Pressable>
  );
});

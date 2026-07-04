import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ProductImageCard } from '@/components/home/product-image-card';
import { Typography } from '@/components/ui/typography';
import type { TrendingProduct } from '@/types/home';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TrendingMaterialCardProps = {
  product: TrendingProduct;
  onPress?: (product: TrendingProduct) => void;
  className?: string;
};

export const TrendingMaterialCard = memo(function TrendingMaterialCard({
  product,
  onPress,
  className,
}: TrendingMaterialCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => onPress?.(product)}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, grade ${product.grade}, ${product.priceLabel}`}
      className={cn(
        'mr-md w-[148px] rounded-xl border border-brand-border/50 bg-brand-white p-sm shadow-sm',
        className,
      )}
      style={animatedStyle}
    >
      <ProductImageCard
        imageUrl={product.imageUrl}
        recyclingKey={product.id}
        className="h-[96px] w-full"
      />

      <View className="mt-sm px-xs pb-xs">
        <Typography
          variant="roleTitle"
          className="text-[13px] text-brand-primary"
          numberOfLines={1}
        >
          {product.name}
        </Typography>
        <Typography
          variant="caption"
          className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
          numberOfLines={1}
        >
          Grade {product.grade}
        </Typography>
        <Typography
          variant="caption"
          className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-heading"
        >
          {product.priceLabel}
        </Typography>
      </View>
    </AnimatedPressable>
  );
});

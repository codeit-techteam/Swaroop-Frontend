import { memo, useState } from 'react';

import { View, useWindowDimensions } from 'react-native';

import { Image } from 'expo-image';

import { cn } from '@/utils/cn';

type ProductHeroProps = {
  imageUrl: string;
  accessibilityLabel?: string;
  className?: string;
};

export const ProductHero = memo(function ProductHero({
  imageUrl,
  accessibilityLabel = 'Product hero image',
  className,
}: ProductHeroProps) {
  const { width } = useWindowDimensions();
  const [loaded, setLoaded] = useState(false);
  const contentWidth = width - 32;
  const height = contentWidth * (9 / 16);

  return (
    <View className={cn('mx-lg overflow-hidden rounded-xl bg-brand-overlay', className)}>
      {!loaded ? (
        <View className="absolute inset-0 bg-brand-primary-light" style={{ height }} />
      ) : null}
      <Image
        source={{ uri: imageUrl }}
        style={{ width: contentWidth, height }}
        contentFit="cover"
        contentPosition="center"
        transition={0}
        cachePolicy="memory-disk"
        onLoad={() => setLoaded(true)}
        accessibilityLabel={accessibilityLabel}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
});

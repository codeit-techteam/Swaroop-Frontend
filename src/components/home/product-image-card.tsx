import { memo } from 'react';

import { View } from 'react-native';

import { Image } from 'expo-image';

import { cn } from '@/utils/cn';

type ProductImageCardProps = {
  imageUrl: string;
  recyclingKey?: string;
  className?: string;
};

export const ProductImageCard = memo(function ProductImageCard({
  imageUrl,
  recyclingKey,
  className,
}: ProductImageCardProps) {
  return (
    <View className={cn('overflow-hidden rounded-lg bg-brand-surface', className)}>
      <Image
        source={{ uri: imageUrl }}
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={180}
        cachePolicy="memory-disk"
        recyclingKey={recyclingKey}
      />
    </View>
  );
});

import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';

import { Typography } from '@/components/ui/typography';
import { HERO_BANNER_HEIGHT } from '@/constants/homeBanners';
import type { HomeBanner } from '@/types/home';
import { cn } from '@/utils/cn';

type HeroBannerProps = {
  banner: HomeBanner;
  width: number;
  onActionPress?: (banner: HomeBanner) => void;
  className?: string;
};

export const HeroBanner = memo(function HeroBanner({
  banner,
  width,
  onActionPress,
  className,
}: HeroBannerProps) {
  return (
    <View
      className={cn('overflow-hidden rounded-xl bg-brand-navy', className)}
      style={{ width, height: HERO_BANNER_HEIGHT }}
    >
      <Image
        source={{ uri: banner.imageUrl }}
        style={{ width, height: HERO_BANNER_HEIGHT }}
        contentFit="cover"
        contentPosition="center"
        transition={0}
        cachePolicy="memory-disk"
        recyclingKey={banner.id}
        accessibilityIgnoresInvertColors
      />

      {/* Overlay gradient layers for readable text without stretching the image */}
      <View className="absolute inset-0 bg-brand-navy/45" />
      <View className="absolute inset-x-0 bottom-0 h-2/3 bg-brand-navy/55" />
      <View className="absolute inset-x-0 bottom-0 h-1/3 bg-brand-navy/70" />

      <View className="absolute inset-0 justify-between px-lg py-md">
        <View>
          <View className="self-start rounded-sm bg-brand-navy/70 px-sm py-xs">
            <Typography variant="badge" className="text-[9px] tracking-[1px] text-brand-white">
              {banner.badge}
            </Typography>
          </View>

          <Typography
            variant="headingLeft"
            className="mt-sm text-[20px] leading-[26px] text-brand-white"
            numberOfLines={2}
          >
            {banner.title}
          </Typography>
          <Typography
            variant="roleTitle"
            className="mt-0.5 text-[15px] text-brand-white"
            numberOfLines={1}
          >
            {banner.subtitle}
          </Typography>
          <Typography
            variant="caption"
            className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-white/90"
            numberOfLines={2}
          >
            {banner.description}
          </Typography>
        </View>

        <Pressable
          onPress={() => onActionPress?.(banner)}
          accessibilityRole="button"
          accessibilityLabel={banner.buttonLabel}
          className="self-start rounded-full bg-brand-white px-md py-sm"
        >
          <Typography variant="badge" className="text-[11px] tracking-[0.4px] text-brand-primary">
            {banner.buttonLabel}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
});

import { memo } from 'react';

import { View } from 'react-native';

import { Image } from 'expo-image';


import { Typography } from '@/components/ui/typography';
import { CHECKOUT_INDUSTRIAL_BANNER } from '@/constants/checkout';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type IndustrialBannerProps = {
  className?: string;
};

export const IndustrialBanner = memo(function IndustrialBanner({ className }: IndustrialBannerProps) {
  return (
    <View

      className={cn('mx-lg overflow-hidden rounded-2xl', className)}
      style={elevation.sm}
    >
      <View className="relative h-[180px] w-full">
        <Image
          source={{ uri: CHECKOUT_INDUSTRIAL_BANNER.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={0}
          accessibilityLabel="Industrial petrochemical facility"
        />

        <View className="absolute inset-0 bg-brand-heading/15" />
        <View className="absolute inset-x-0 bottom-0 h-2/3 bg-brand-white/55" />
        <View className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-white/85" />
        <View className="absolute inset-x-0 bottom-0 h-1/4 bg-brand-white" />

        <View className="absolute bottom-0 left-0 right-0 px-lg pb-lg pt-md">
          {CHECKOUT_INDUSTRIAL_BANNER.features.map((feature) => (
            <View key={feature} className="mb-xs flex-row items-center">
              <View className="mr-sm h-1.5 w-1.5 rounded-full bg-brand-primary" />
              <Typography variant="roleDescription" className="text-[12px] text-brand-heading">
                {feature}
              </Typography>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type CustomQuoteCardProps = {
  className?: string;
};

export const CustomQuoteCard = memo(function CustomQuoteCard({ className }: CustomQuoteCardProps) {
  const handlePress = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Custom enterprise logistics quotes will be available shortly.',
      visibilityTime: 2000,
    });
  };

  return (
    <Animated.View entering={FadeIn.duration(300).delay(250)}>
      <View
        className={cn('relative overflow-hidden rounded-2xl bg-brand-card-blue p-lg', className)}
      >
        <View className="absolute inset-0 bg-brand-navy/20" />
        <View className="absolute -bottom-6 -right-4 opacity-15">
          <TruckIcon size={120} color={brandColors.white} />
        </View>

        <View className="relative">
          <Typography variant="headingLeft" className="text-[18px] text-brand-white">
            Need bulk logistics?
          </Typography>
          <Typography
            variant="subheadingLeft"
            className="mt-sm max-w-[90%] text-[13px] leading-5 text-brand-white/85"
          >
            Connect with PetroTrade logistics experts for customized enterprise shipments across
            India.
          </Typography>

          <Pressable
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel="Get custom quote"
            className="mt-lg self-start rounded-lg bg-brand-white px-md py-sm"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Typography variant="badge" className="text-[11px] tracking-[0.6px] text-brand-primary">
              GET CUSTOM QUOTE
            </Typography>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
});

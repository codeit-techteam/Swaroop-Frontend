import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { TruckIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type CustomQuoteCardProps = {
  className?: string;
};

export const CustomQuoteCard = memo(function CustomQuoteCard({ className }: CustomQuoteCardProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push(ROUTES.CUSTOMER.BULK_LOGISTICS_QUOTE as Href);
  }, [router]);

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
            accessibilityLabel="Get bulk logistics quote"
            className="mt-lg self-start rounded-lg bg-brand-white px-md py-sm"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Typography variant="badge" className="text-[11px] tracking-[0.6px] text-brand-primary">
              GET BULK LOGISTICS
            </Typography>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
});

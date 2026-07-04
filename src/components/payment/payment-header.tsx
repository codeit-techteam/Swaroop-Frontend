import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { BackArrowIcon, HelpIcon, LocationPinIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type PaymentHeaderProps = {
  title?: string;
  onBackPress: () => void;
  onHelpPress?: () => void;
  onLocationPress?: () => void;
  showLocation?: boolean;
  className?: string;
};

export const PaymentHeader = memo(function PaymentHeader({
  title = 'Payment Selection',
  onBackPress,
  onHelpPress,
  onLocationPress,
  showLocation = false,
  className,
}: PaymentHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center">
          <Pressable
            onPress={onBackPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-sm h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.heading} />
          </Pressable>
          <Typography
            variant="roleTitle"
            className="mr-2 flex-shrink text-[17px] text-brand-heading"
            numberOfLines={1}
          >
            {title}
          </Typography>
        </View>

        {showLocation ? (
          <Pressable
            onPress={onLocationPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Location"
            className="h-10 w-10 items-center justify-center"
          >
            <LocationPinIcon size={iconSizes.lg} color={brandColors.primary} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onHelpPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Help"
            className="h-10 w-10 items-center justify-center"
          >
            <HelpIcon size={iconSizes.lg} color={brandColors.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
});

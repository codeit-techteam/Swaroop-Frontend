import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { BackArrowIcon, HelpIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type PaymentHeaderProps = {
  onBackPress: () => void;
  onHelpPress?: () => void;
  className?: string;
};

export const PaymentHeader = memo(function PaymentHeader({
  onBackPress,
  onHelpPress,
  className,
}: PaymentHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={onBackPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-sm h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.heading} />
          </Pressable>
          <Typography variant="roleTitle" className="text-[17px] text-brand-heading">
            Payment Selection
          </Typography>
        </View>

        <Pressable
          onPress={onHelpPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Help"
          className="h-10 w-10 items-center justify-center"
        >
          <HelpIcon size={iconSizes.lg} color={brandColors.primary} />
        </Pressable>
      </View>
    </View>
  );
});

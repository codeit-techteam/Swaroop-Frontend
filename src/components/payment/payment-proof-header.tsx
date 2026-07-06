import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { BackArrowIcon, HelpIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type PaymentProofHeaderProps = {
  title?: string;
  subtitle?: string;
  onBackPress: () => void;
  onHelpPress?: () => void;
  className?: string;
};

export const PaymentProofHeader = memo(function PaymentProofHeader({
  title = 'Upload Payment Proof',
  subtitle = 'Secure Payment',
  onBackPress,
  onHelpPress,
  className,
}: PaymentProofHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-16 w-full flex-row items-center justify-between">
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
          <View className="min-w-0 flex-1">
            <Typography
              variant="roleTitle"
              className="text-[17px] text-brand-heading"
              numberOfLines={1}
            >
              {title}
            </Typography>
            <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
              {subtitle}
            </Typography>
          </View>
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

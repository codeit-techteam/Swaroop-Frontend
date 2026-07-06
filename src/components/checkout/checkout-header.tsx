import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { BackArrowIcon, LockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type CheckoutHeaderProps = {
  onBackPress: () => void;
  className?: string;
};

export const CheckoutHeader = memo(function CheckoutHeader({
  onBackPress,
  className,
}: CheckoutHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="w-full flex-row items-center justify-between py-md">
        <View className="min-w-0 flex-1 flex-row items-center">
          <Pressable
            onPress={onBackPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-sm h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.primary} />
          </Pressable>

          <View className="min-w-0 flex-1">
            <Typography variant="roleTitle" className="text-[18px] text-brand-heading">
              Checkout
            </Typography>
            <Typography
              variant="fieldLabel"
              className="mt-0.5 text-[10px] tracking-[1.2px] text-brand-muted"
            >
              ORDER REVIEW
            </Typography>
          </View>
        </View>

        <View className="ml-sm flex-row items-center rounded-full border border-brand-primary/30 bg-brand-primary-light px-sm py-xs">
          <LockIcon size={iconSizes.xs} color={brandColors.primary} />
          <Typography variant="roleDescription" className="ml-xs text-[11px] text-brand-primary">
            Secure Checkout
          </Typography>
        </View>
      </View>
    </View>
  );
});

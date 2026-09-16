import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { BackArrowIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type CartHeaderProps = {
  onBackPress: () => void;
  className?: string;
};

export const CartHeader = memo(function CartHeader({
  onBackPress,
  className,
}: CartHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('w-full border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-between">
        <Pressable
          onPress={onBackPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <BackArrowIcon color={brandColors.primary} />
        </Pressable>

        <Typography variant="roleTitle" className="text-[17px] text-brand-heading">
          Cart
        </Typography>

        <View className="h-10 w-10" />
      </View>
    </View>
  );
});

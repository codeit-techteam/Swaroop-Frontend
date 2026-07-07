import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { BackArrowIcon } from '@/icons';
import { cn } from '@/utils/cn';

type AppHeaderProps = {
  variant?: 'role' | 'back' | 'none';
  title?: string;
  onBack?: () => void;
  className?: string;
};

export const AppHeader = memo(function AppHeader({
  variant = 'role',
  title,
  onBack,
  className,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  if (variant === 'back') {
    return (
      <View className={cn('h-12 w-full flex-row items-center', className)}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <BackArrowIcon />
        </Pressable>
        <Typography variant="logo" className="flex-1 pr-10 text-center">
          {title}
        </Typography>
      </View>
    );
  }

  if (variant === 'none') {
    return null;
  }

  return (
    <View
      className={cn('w-full bg-brand-white px-xl', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center justify-center">
        <Typography variant="logoUpper">PETROTRADE</Typography>
      </View>
    </View>
  );
});

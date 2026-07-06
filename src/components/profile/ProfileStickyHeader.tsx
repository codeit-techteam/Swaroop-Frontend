import { memo } from 'react';

import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/ui/app-logo';
import { cn } from '@/utils/cn';

type ProfileStickyHeaderProps = {
  className?: string;
};

export const ProfileStickyHeader = memo(function ProfileStickyHeader({
  className,
}: ProfileStickyHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('border-b border-brand-border bg-brand-white px-lg', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="h-14 w-full flex-row items-center">
        <AppLogo />
      </View>
    </View>
  );
});

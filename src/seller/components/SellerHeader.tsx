import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogo, Typography } from '@/components';
import { BackArrowIcon, BellIcon, MenuIcon } from '@/icons';
import { cn } from '@/utils/cn';

type SellerHeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  rightActionLabel?: string;
  onBack?: () => void;
  onMenuPress?: () => void;
  onRightActionPress?: () => void;
  onBellPress?: () => void;
  className?: string;
};

export const SellerHeader = memo(function SellerHeader({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  showBell = false,
  rightActionLabel,
  onBack,
  onMenuPress,
  onRightActionPress,
  onBellPress,
  className,
}: SellerHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('bg-brand-white px-xl pb-md', className)}
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className="min-h-12 flex-row items-center justify-between">
        <View className="w-12 items-start justify-center">
          {showBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="h-10 w-10 items-center justify-center"
            >
              <BackArrowIcon />
            </Pressable>
          ) : showMenu ? (
            <Pressable
              onPress={onMenuPress}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Open seller menu"
              className="h-10 w-10 items-center justify-center"
            >
              <MenuIcon />
            </Pressable>
          ) : (
            <AppLogo />
          )}
        </View>

        <View className="flex-1 px-md">
          {title ? (
            <Typography variant="logo" className="text-center text-brand-heading">
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography variant="legal" className="mt-0.5 text-center">
              {subtitle}
            </Typography>
          ) : null}
        </View>

        <View className="w-20 items-end justify-center">
          {rightActionLabel ? (
            <Pressable onPress={onRightActionPress} hitSlop={8} accessibilityRole="button">
              <Typography variant="link" className="text-[12px]">
                {rightActionLabel}
              </Typography>
            </Pressable>
          ) : showBell ? (
            <Pressable
              onPress={onBellPress}
              accessibilityRole="button"
              accessibilityLabel="Seller notifications"
              className="h-10 w-10 items-center justify-center"
            >
              <BellIcon />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
});

import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import { AppLogo } from '@/components/ui/app-logo';
import { Typography } from '@/components/ui/typography';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

type HeaderProps = {
  className?: string;
  showSkip?: boolean;
  onSkip?: () => void;
  rightSlot?: ReactNode;
};

export const Header = memo(function Header({
  className,
  showSkip = false,
  onSkip,
  rightSlot,
}: HeaderProps) {
  return (
    <View
      className={cn('w-full flex-row items-center justify-between', className)}
      style={{ paddingTop: spacing.screenTop, minHeight: 44 }}
    >
      <AppLogo />
      {rightSlot}
      {showSkip && !rightSlot ? (
        <Pressable
          onPress={onSkip}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Typography variant="skip">Skip</Typography>
        </Pressable>
      ) : null}
      {!showSkip && !rightSlot ? <View style={{ width: 40 }} /> : null}
    </View>
  );
});

import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { FactoryLogo } from '@/icons/factory-logo';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

type AppLogoProps = {
  className?: string;
  size?: number;
  color?: string;
};

export const AppLogo = memo(function AppLogo({
  className,
  size = iconSizes.logoSmall,
  color = brandColors.primary,
}: AppLogoProps) {
  return (
    <View
      className={cn('flex-row items-center', className)}
      style={{ gap: spacing.sm }}
      accessibilityRole="header"
      accessibilityLabel="PetroTrade"
    >
      <FactoryLogo size={size} color={color} />
      <Typography variant="logo" style={{ color }}>
        PetroTrade
      </Typography>
    </View>
  );
});

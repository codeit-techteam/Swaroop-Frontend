import { memo } from 'react';

import { Image, Text, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { APP_NAME } from '@/constants';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

/** Full brand lockup (circular mark + baked-in “Polystore” wordmark). */
const logoFullSource = require('../../../assets/logo/polystorex-logo.png');
/** Circular symbol only — safe for compact headers and icon-sized slots. */
const logoMarkSource = require('../../../assets/logo/polystorex-mark.png');

type AppLogoProps = {
  className?: string;
  size?: number;
  color?: string;
  /**
   * `mark` = compact icon+name
   * `full` = logo asset only (includes baked-in wordmark)
   * `splash` = circular mark + PolyStoreX wordmark (single brand lockup)
   */
  variant?: 'full' | 'mark' | 'splash';
};

function BrandMark({ size }: { size: number }) {
  return (
    <Image
      source={logoMarkSource}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

function SplashWordmark({ color }: { color: string }) {
  // Do not set accessibilityRole="header" here — the splash lockup View is already the header.
  // Nested headers become nested <h1> on web and crash the a11y tree.
  return (
    <Text
      style={{
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: 0.6,
        color,
        textAlign: 'center',
      }}
    >
      PolyStore
      <Text style={{ color: brandColors.accent }}>X</Text>
    </Text>
  );
}

export const AppLogo = memo(function AppLogo({
  className,
  size = iconSizes.logoSmall,
  color = brandColors.primary,
  variant = 'mark',
}: AppLogoProps) {
  if (variant === 'splash') {
    const markSize = Math.max(size * 1.35, 108);
    return (
      <View
        className={cn('items-center justify-center', className)}
        accessibilityRole="header"
        accessibilityLabel={APP_NAME}
        style={{ gap: spacing.xl }}
      >
        <BrandMark size={markSize} />
        <SplashWordmark color={color} />
      </View>
    );
  }

  if (variant === 'full') {
    return (
      <View
        className={cn('items-center justify-center', className)}
        accessibilityRole="header"
        accessibilityLabel={APP_NAME}
      >
        <Image
          source={logoFullSource}
          style={{ width: size * 2.8, height: size * 2.8 }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View
      className={cn('flex-row items-center', className)}
      style={{ gap: spacing.sm }}
      accessibilityRole="header"
      accessibilityLabel={APP_NAME}
    >
      <BrandMark size={size * 1.35} />
      <Typography variant="logo" style={{ color }}>
        {APP_NAME}
      </Typography>
    </View>
  );
});

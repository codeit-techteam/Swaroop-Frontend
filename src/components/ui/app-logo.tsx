import { memo } from 'react';

import { Image, View } from 'react-native';

import { APP_NAME } from '@/constants';
import { cn } from '@/utils/cn';

/** Official lockup with a transparent background. White type — use on black or navy. */
const logoOnDark = require('../../../assets/brand/polystorex-logo-transparent.png');
/** Transparent dark wordmark for light / white screens — no black plate. */
const logoOnLight = require('../../../assets/brand/polystorex-logo-on-light.png');
/** Orbital symbol only. */
const logoMark = require('../../../assets/brand/polystorex-symbol.png');

const LOCKUP_ASPECT = 848 / 372;
const MARK_ASPECT = 216 / 169;

type AppLogoProps = {
  className?: string;
  /** Rendered height for `full` / `mark`. For `splash`, this is the lockup width. */
  size?: number;
  color?: string;
  /**
   * `mark` = orbital symbol for compact headers.
   * `full` = official lockup for light screens (transparent, dark wordmark).
   * `splash` = official lockup for a black splash (transparent, white wordmark).
   */
  variant?: 'full' | 'mark' | 'splash';
};

export const AppLogo = memo(function AppLogo({
  className,
  size = 32,
  variant = 'mark',
}: AppLogoProps) {
  if (variant === 'splash') {
    const width = size;
    const height = width / LOCKUP_ASPECT;
    return (
      <View className={cn('items-center justify-center', className)} accessibilityRole="header" accessibilityLabel={APP_NAME}>
        <Image
          source={logoOnDark}
          style={{ width, height }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  if (variant === 'full') {
    const height = size;
    const width = height * LOCKUP_ASPECT;
    return (
      <View className={cn('items-center justify-center', className)} accessibilityRole="header" accessibilityLabel={APP_NAME}>
        <Image
          source={logoOnLight}
          style={{ width, height }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  const height = size;
  const width = height * MARK_ASPECT;
  return (
    <View
      className={cn('items-center justify-center', className)}
      accessibilityRole="header"
      accessibilityLabel={APP_NAME}
    >
      <Image
        source={logoMark}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
});

import { memo, useCallback } from 'react';

import { Image, Pressable, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { APP_NAME } from '@/constants';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { safeGoBack } from '@/navigation/safe-back';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

const logoSource = require('../../../assets/logo/polystorex-logo.png'); // project root assets


type AppHeaderProps = {
  variant?: 'role' | 'back' | 'none';
  title?: string;
  onBack?: () => void;
  /** Used when `onBack` is omitted and the stack has no history. */
  fallbackHref?: Href;
  className?: string;
};

export const AppHeader = memo(function AppHeader({
  variant = 'role',
  title,
  onBack,
  fallbackHref = ROUTES.CUSTOMER.HOME as Href,
  className,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    safeGoBack(router, fallbackHref);
  }, [fallbackHref, onBack, router]);

  if (variant === 'back') {
    return (
      <View className={cn('h-12 w-full flex-row items-center', className)}>
        <Pressable
          onPress={handleBack}
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
    <View className={cn('w-full px-xl', className)} style={{ paddingTop: insets.top }}>
      <View className="h-14 w-full flex-row items-center justify-center gap-sm">
        <Image
          source={logoSource}
          style={{
            width: iconSizes.logoSmall * 1.35,
            height: iconSizes.logoSmall * 1.35,
            resizeMode: 'contain',
          }}
          accessibilityIgnoresInvertColors
        />
        <Typography variant="logoUpper" style={{ color: brandColors.primary }}>
          {APP_NAME.toUpperCase()}
        </Typography>
      </View>
    </View>
  );
});

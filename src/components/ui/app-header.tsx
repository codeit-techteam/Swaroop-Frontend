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
import { cn } from '@/utils/cn';

const logoOnLight = require('../../../assets/brand/polystorex-logo-light-bg.png');


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
        <Typography variant="logo" className="flex-1 pr-10 text-center" style={{ color: brandColors.heading }}>
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
      <View className="w-full items-center justify-center py-md">
        <Image
          source={logoOnLight}
          style={{ width: 220, height: 220 / (928 / 436) }}
          resizeMode="contain"
          accessibilityLabel={APP_NAME}
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
});

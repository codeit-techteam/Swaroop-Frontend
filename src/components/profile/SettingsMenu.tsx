import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { ProfileSectionHeader } from '@/components/profile/ProfileSectionHeader';
import { Typography } from '@/components/ui/typography';
import { SETTINGS_MENU_ITEMS } from '@/constants/profile';
import { BellIcon, ChevronRightIcon, HeadsetIcon, LogoutIcon, ShieldCheckIcon } from '@/icons';
import { showConfirmDialog } from '@/store/dialog-store';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type SettingsMenuProps = {
  onLogout: () => void;
  onNotifications?: () => void;
  onHelpSupport?: () => void;
  className?: string;
};

const MENU_ICONS = {
  notifications: BellIcon,
  help: HeadsetIcon,
  terms: ShieldCheckIcon,
  logout: LogoutIcon,
} as const;

export const SettingsMenu = memo(function SettingsMenu({
  onLogout,
  onNotifications,
  onHelpSupport,
  className,
}: SettingsMenuProps) {
  const showComingSoon = useCallback((title: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: 'This feature is coming soon.',
      visibilityTime: 2000,
    });
  }, []);

  const handleLogoutPress = useCallback(() => {
    showConfirmDialog({
      variant: 'danger',
      title: 'Logout Account',
      message: 'You will need to sign in again to access your PetroTrade account.',
      confirmLabel: 'Logout',
      cancelLabel: 'Cancel',
      onConfirm: onLogout,
    });
  }, [onLogout]);

  const handleItemPress = useCallback(
    (id: string, title: string) => {
      if (id === 'logout') {
        handleLogoutPress();
        return;
      }

      if (id === 'notifications' && onNotifications) {
        onNotifications();
        return;
      }

      if (id === 'help' && onHelpSupport) {
        onHelpSupport();
        return;
      }

      showComingSoon(title);
    },
    [handleLogoutPress, onHelpSupport, onNotifications, showComingSoon],
  );

  return (
    <Animated.View entering={FadeIn.duration(300).delay(200)}>
      <View
        className={cn(
          'rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm',
          className,
        )}
      >
        <ProfileSectionHeader title="Settings" />

        <View className="mt-md">
          {SETTINGS_MENU_ITEMS.map((item, index) => {
            const IconComponent = MENU_ICONS[item.id];
            const isDestructive = item.id === 'logout';
            const iconColor = isDestructive ? brandColors.error : brandColors.secondaryButton;
            const isLast = index === SETTINGS_MENU_ITEMS.length - 1;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleItemPress(item.id, item.title)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                className={cn(
                  'flex-row items-center py-md',
                  !isLast && 'border-b border-brand-border',
                )}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View className="mr-md h-10 w-10 items-center justify-center">
                  <IconComponent size={20} color={iconColor} />
                </View>

                <Typography
                  variant="roleTitle"
                  className={cn(
                    'flex-1 text-[15px]',
                    isDestructive ? 'text-brand-error' : 'text-brand-heading',
                  )}
                >
                  {item.title}
                </Typography>

                {!isDestructive ? <ChevronRightIcon color={brandColors.muted} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
});

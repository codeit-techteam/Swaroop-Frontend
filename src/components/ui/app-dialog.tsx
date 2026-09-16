import { memo, type ReactNode, useCallback, useMemo } from 'react';

import { Modal, Pressable, View } from 'react-native';

import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  HeadsetIcon,
  InfoIcon,
  LocationPinIcon,
  LogoutIcon,
} from '@/icons';
import { hideAppDialog, useDialogStore } from '@/store/dialog-store';
import type { AppDialogVariant } from '@/store/dialog-store';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DialogShellProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissible?: boolean;
};

const VARIANT_THEME: Record<
  AppDialogVariant,
  { iconBg: string; iconColor: string; confirmClass: string; confirmTextClass: string }
> = {
  info: {
    iconBg: 'bg-brand-primary-light',
    iconColor: brandColors.primaryDark,
    confirmClass: 'bg-brand-heading',
    confirmTextClass: 'text-brand-white',
  },
  success: {
    iconBg: 'bg-brand-success-light',
    iconColor: brandColors.success,
    confirmClass: 'bg-brand-success',
    confirmTextClass: 'text-brand-white',
  },
  warning: {
    iconBg: 'bg-[#FFF4E5]',
    iconColor: '#B45309',
    confirmClass: 'bg-[#B45309]',
    confirmTextClass: 'text-brand-white',
  },
  danger: {
    iconBg: 'bg-brand-error-light',
    iconColor: brandColors.error,
    confirmClass: 'bg-brand-error',
    confirmTextClass: 'text-brand-white',
  },
};

export const DialogShell = memo(function DialogShell({
  visible,
  onClose,
  children,
  dismissible = true,
}: DialogShellProps) {
  const handleBackdrop = useCallback(() => {
    if (dismissible) {
      onClose();
    }
  }, [dismissible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}
      statusBarTranslucent
    >
      <View
        className="flex-1 items-center justify-center px-xl"
        style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
      >
        <Pressable
          className="absolute inset-0"
          onPress={handleBackdrop}
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
        />
        <Animated.View
          entering={FadeInDown.springify().damping(18).stiffness(220)}
          className="z-10 w-full max-w-[400px]"
        >
          <View
            className="relative overflow-hidden rounded-[28px] bg-brand-white px-xl pb-xl pt-xl"
            style={elevation.xl}
          >
            {dismissible ? (
              <Pressable
                onPress={onClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                className="absolute right-md top-md z-10 h-8 w-8 items-center justify-center rounded-full bg-brand-surface"
              >
                <Typography variant="roleTitle" className="text-[16px] text-brand-footer">
                  ×
                </Typography>
              </Pressable>
            ) : null}
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const DialogVariantIcon = memo(function DialogVariantIcon({
  variant,
  title,
}: {
  variant: AppDialogVariant;
  title: string;
}) {
  const theme = VARIANT_THEME[variant];
  const isLogout = title.toLowerCase().includes('logout');
  const isSupport = title.toLowerCase().includes('support');
  const iconSize = iconSizes.xl;

  if (isLogout) {
    return <LogoutIcon size={iconSize} color={theme.iconColor} />;
  }
  if (isSupport) {
    return <HeadsetIcon size={iconSize} color={theme.iconColor} />;
  }
  if (variant === 'success') {
    return <CheckCircleIcon size={iconSize} color={theme.iconColor} />;
  }
  if (variant === 'warning' || variant === 'danger') {
    return <AlertCircleIcon size={iconSize} color={theme.iconColor} />;
  }
  return <InfoIcon size={iconSize} color={theme.iconColor} />;
});

export const AppDialogHost = memo(function AppDialogHost() {
  const dialog = useDialogStore((state) => state.dialog);

  const variant = dialog?.variant ?? 'info';
  const theme = VARIANT_THEME[variant];
  const hasChoices = Boolean(dialog?.choices?.length);
  const showCancel = Boolean(dialog?.cancelLabel) || hasChoices;
  const showConfirm = Boolean(dialog?.confirmLabel) && !hasChoices;

  const handleClose = useCallback(() => {
    dialog?.onCancel?.();
    hideAppDialog();
  }, [dialog]);

  const handleConfirm = useCallback(() => {
    const onConfirm = dialog?.onConfirm;
    hideAppDialog();
    onConfirm?.();
  }, [dialog]);

  const actions = useMemo(() => {
    if (!dialog) {
      return null;
    }

    if (hasChoices) {
      return (
        <View className="mt-lg" style={{ gap: 8 }}>
          {dialog.choices?.map((choice) => (
            <Pressable
              key={choice.id}
              onPress={() => {
                hideAppDialog();
                choice.onPress();
              }}
              accessibilityRole="button"
              accessibilityLabel={choice.label}
              className="flex-row items-center rounded-2xl border border-brand-border bg-brand-surface px-md py-md"
              style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
            >
              <View className="mr-md h-10 w-10 items-center justify-center rounded-full bg-brand-primary-light">
                <LocationPinIcon size={18} color={brandColors.primaryDark} />
              </View>
              <View className="flex-1">
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  {choice.label}
                </Typography>
                {choice.description ? (
                  <Typography
                    variant="caption"
                    className="mt-xs text-[11px] normal-case tracking-normal text-brand-muted"
                  >
                    {choice.description}
                  </Typography>
                ) : null}
              </View>
            </Pressable>
          ))}
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={dialog.cancelLabel ?? 'Cancel'}
            className="mt-sm h-12 items-center justify-center rounded-2xl bg-brand-surface"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
              {dialog.cancelLabel ?? 'Cancel'}
            </Typography>
          </Pressable>
        </View>
      );
    }

    return (
      <View className={cn('mt-xl', showCancel ? 'flex-row' : undefined)} style={{ gap: 10 }}>
        {showCancel ? (
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel={dialog.cancelLabel ?? 'Cancel'}
            className="h-12 flex-1 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
              {dialog.cancelLabel ?? 'Cancel'}
            </Typography>
          </Pressable>
        ) : null}
        {showConfirm ? (
          <Pressable
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel={dialog.confirmLabel}
            className={cn(
              'h-12 items-center justify-center rounded-2xl',
              theme.confirmClass,
              showCancel ? 'flex-1' : 'w-full',
            )}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Typography
              variant="button"
              className={cn('text-[15px] tracking-normal', theme.confirmTextClass)}
            >
              {dialog.confirmLabel}
            </Typography>
          </Pressable>
        ) : null}
      </View>
    );
  }, [
    dialog,
    handleClose,
    handleConfirm,
    hasChoices,
    showCancel,
    showConfirm,
    theme.confirmClass,
    theme.confirmTextClass,
  ]);

  if (!dialog) {
    return null;
  }

  return (
    <DialogShell visible onClose={handleClose} dismissible={dialog.dismissible !== false}>
      <View className="items-center">
        <Animated.View entering={FadeIn.duration(220)}>
          <View className={cn('h-16 w-16 items-center justify-center rounded-full', theme.iconBg)}>
            <DialogVariantIcon variant={variant} title={dialog.title} />
          </View>
        </Animated.View>

        <Typography variant="heading" className="mt-lg text-[20px] leading-[26px]">
          {dialog.title}
        </Typography>
        {dialog.message ? (
          <Typography variant="subheading" className="mt-sm text-[14px] leading-[21px]">
            {dialog.message}
          </Typography>
        ) : null}
      </View>
      {actions}
    </DialogShell>
  );
});

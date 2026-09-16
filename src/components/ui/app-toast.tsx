import { Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast, { type ToastConfig } from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type ToastTone = 'info' | 'success' | 'error';

const TONE_STYLES: Record<
  ToastTone,
  { rail: string; iconBg: string; accent: string; Icon: typeof InfoIcon }
> = {
  info: {
    rail: 'bg-brand-primary',
    iconBg: 'bg-brand-primary-light',
    accent: brandColors.primaryDark,
    Icon: InfoIcon,
  },
  success: {
    rail: 'bg-brand-success',
    iconBg: 'bg-brand-success-light',
    accent: brandColors.success,
    Icon: CheckCircleIcon,
  },
  error: {
    rail: 'bg-brand-error',
    iconBg: 'bg-brand-error-light',
    accent: brandColors.error,
    Icon: AlertCircleIcon,
  },
};

type ToastCardProps = {
  text1?: string;
  text2?: string;
  tone: ToastTone;
  hide: () => void;
};

const ToastCard = ({ text1, text2, tone, hide }: ToastCardProps) => {
  const theme = TONE_STYLES[tone];
  const Icon = theme.Icon;

  return (
    <View className="w-full px-lg">
      <View
        className="overflow-hidden rounded-[22px] border border-brand-border bg-brand-white"
        style={elevation.lg}
      >
        <View className="flex-row items-stretch">
          <View className={cn('w-1.5', theme.rail)} />
          <View className="flex-1 flex-row items-center px-md py-md">
            <View
              className={cn(
                'mr-md h-10 w-10 items-center justify-center rounded-2xl',
                theme.iconBg,
              )}
            >
              <Icon size={18} color={theme.accent} />
            </View>
            <View className="min-w-0 flex-1 pr-sm">
              {text1 ? (
                <Typography
                  variant="roleTitle"
                  className="text-[14px] leading-[18px] text-brand-heading"
                >
                  {text1}
                </Typography>
              ) : null}
              {text2 ? (
                <Typography
                  variant="legal"
                  className="mt-xs text-left text-[12px] leading-[16px] text-brand-body"
                  numberOfLines={2}
                >
                  {text2}
                </Typography>
              ) : null}
            </View>
            <Pressable
              onPress={hide}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              className="h-8 w-8 items-center justify-center rounded-full bg-brand-surface"
            >
              <Typography variant="roleTitle" className="text-[16px] text-brand-footer">
                ×
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export const appToastConfig: ToastConfig = {
  success: ({ text1, text2, hide }) => (
    <ToastCard text1={text1} text2={text2} tone="success" hide={hide} />
  ),
  error: ({ text1, text2, hide }) => (
    <ToastCard text1={text1} text2={text2} tone="error" hide={hide} />
  ),
  info: ({ text1, text2, hide }) => (
    <ToastCard text1={text1} text2={text2} tone="info" hide={hide} />
  ),
};

export const AppToastHost = () => {
  const insets = useSafeAreaInsets();

  return (
    <Toast config={appToastConfig} topOffset={insets.top + 12} visibilityTime={3200} swipeable />
  );
};

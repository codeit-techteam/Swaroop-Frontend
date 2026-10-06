import { memo } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type ProfileDataStateProps = {
  variant: 'loading' | 'error' | 'empty';
  title: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export const ProfileDataState = memo(function ProfileDataState({
  variant,
  title,
  message,
  onRetry,
  className,
}: ProfileDataStateProps) {
  return (
    <View
      className={cn(
        'items-center rounded-2xl border border-brand-border bg-brand-white p-xl',
        className,
      )}
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
    >
      {variant === 'loading' ? <ActivityIndicator color={brandColors.primary} /> : null}
      <Typography
        variant="roleTitle"
        className={cn(
          'text-center text-[15px] text-brand-heading',
          variant === 'loading' && 'mt-md',
        )}
      >
        {title}
      </Typography>
      {message ? (
        <Typography
          variant="caption"
          className="mt-xs text-center font-sans normal-case tracking-normal text-brand-muted"
        >
          {message}
        </Typography>
      ) : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          className="mt-md rounded-lg bg-brand-primary-tint px-lg py-sm"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Typography variant="badge" className="text-brand-primary">
            Try again
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});

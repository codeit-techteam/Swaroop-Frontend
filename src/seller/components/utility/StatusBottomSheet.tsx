import { memo } from 'react';

import { View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { AlertCircleIcon, CheckCircleIcon } from '@/icons';
import { SellerSheetShell } from '@/seller/components/SellerSheetShell';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type StatusBottomSheetProps = {
  visible: boolean;
  variant: 'success' | 'error';
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onDismiss: () => void;
};

export const StatusBottomSheet = memo(function StatusBottomSheet({
  visible,
  variant,
  title,
  message,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onDismiss,
}: StatusBottomSheetProps) {
  const isSuccess = variant === 'success';
  const defaultPrimary = isSuccess ? 'Done' : 'Retry';
  const defaultSecondary = isSuccess ? undefined : 'Cancel';

  return (
    <SellerSheetShell visible={visible} onClose={onDismiss}>
      <View className="items-center pb-sm">
        <View
          className={cn(
            'h-16 w-16 items-center justify-center rounded-full',
            isSuccess ? 'bg-brand-success-light' : 'bg-brand-error-light',
          )}
        >
          {isSuccess ? (
            <CheckCircleIcon size={28} color={brandColors.success} />
          ) : (
            <AlertCircleIcon size={28} color={brandColors.error} />
          )}
        </View>
        <Typography variant="headingLeft" className="mt-md text-center text-[22px]">
          {title}
        </Typography>
        <Typography variant="subheading" className="mt-sm text-center text-brand-body">
          {message}
        </Typography>
      </View>
      <View className="mt-lg gap-sm">
        <PrimaryButton
          label={primaryLabel ?? defaultPrimary}
          className="rounded-2xl bg-brand-navy"
          onPress={() => {
            onPrimary?.();
            onDismiss();
          }}
        />
        {(secondaryLabel ?? defaultSecondary) ? (
          <SecondaryButton
            label={secondaryLabel ?? defaultSecondary ?? 'Cancel'}
            variant="outline"
            onPress={() => {
              onSecondary?.();
              onDismiss();
            }}
          />
        ) : null}
      </View>
    </SellerSheetShell>
  );
});

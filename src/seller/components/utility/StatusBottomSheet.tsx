import { memo } from 'react';

import { Modal, Pressable, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { AlertCircleIcon, CheckCircleIcon } from '@/icons';
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onDismiss}>
        <Pressable className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg" onPress={() => undefined}>
          <View className="mb-lg h-1 w-12 self-center rounded-full bg-brand-border" />
          <View className="items-center">
            <View
              className={cn(
                'h-14 w-14 items-center justify-center rounded-full',
                isSuccess ? 'bg-brand-primary-light' : 'bg-red-50',
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
          <View className="mt-xl gap-sm">
            <PrimaryButton
              label={primaryLabel ?? defaultPrimary}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
});

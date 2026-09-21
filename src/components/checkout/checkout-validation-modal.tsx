import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { DialogShell } from '@/components/ui/app-dialog';
import { Typography } from '@/components/ui/typography';
import { AlertCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type CheckoutValidationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export const CheckoutValidationModal = memo(function CheckoutValidationModal({
  visible,
  title,
  message,
  confirmLabel = 'Review Cart',
  onConfirm,
  onClose,
}: CheckoutValidationModalProps) {
  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-error-light">
          <AlertCircleIcon size={iconSizes.xl} color={brandColors.error} />
        </View>
        <Typography variant="heading" className="mt-lg text-[20px] leading-[26px]">
          {title}
        </Typography>
        <Typography variant="subheading" className="mt-sm text-[14px] leading-[21px]">
          {message}
        </Typography>
      </View>
      <Pressable
        onPress={onConfirm}
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
        className="mt-xl h-12 items-center justify-center rounded-2xl bg-brand-heading"
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      >
        <Typography variant="button" className="text-[15px] tracking-normal text-brand-white">
          {confirmLabel}
        </Typography>
      </Pressable>
    </DialogShell>
  );
});

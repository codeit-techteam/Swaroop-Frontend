import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { DialogShell } from '@/components/ui/app-dialog';
import { Typography } from '@/components/ui/typography';
import { PAYMENT_MATRIX_INFO } from '@/constants/payment-comparison';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type PaymentInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PaymentInfoModal = memo(function PaymentInfoModal({
  visible,
  onClose,
}: PaymentInfoModalProps) {
  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary-light">
          <InfoIcon size={iconSizes.xl} color={brandColors.primaryDark} />
        </View>
        <Typography variant="heading" className="mt-lg text-[20px] leading-[26px]">
          Payment Matrix
        </Typography>
        <Typography variant="subheading" className="mt-sm text-[14px] leading-[21px]">
          {PAYMENT_MATRIX_INFO}
        </Typography>
      </View>

      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Got it"
        className="mt-xl h-12 items-center justify-center rounded-2xl bg-brand-heading"
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      >
        <Typography variant="button" className="text-[15px] tracking-normal">
          Got it
        </Typography>
      </Pressable>
    </DialogShell>
  );
});

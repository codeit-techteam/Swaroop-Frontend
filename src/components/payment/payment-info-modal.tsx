import { memo } from 'react';

import { Modal, Pressable, View } from 'react-native';

import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { PAYMENT_MATRIX_INFO } from '@/constants/payment-comparison';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

type PaymentInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PaymentInfoModal = memo(function PaymentInfoModal({
  visible,
  onClose,
}: PaymentInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-6"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close payment matrix information"
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          className="w-full"
        >
          <Pressable onPress={(event) => event.stopPropagation()}>
            <Animated.View
              entering={ZoomIn.duration(220).springify().damping(16)}
              exiting={ZoomOut.duration(140)}
              className="rounded-2xl border border-brand-border bg-brand-white px-5 py-5"
              style={elevation.md}
            >
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-brand-primary-tint">
                  <InfoIcon size={iconSizes.md} color={brandColors.primary} />
                </View>
                <Typography variant="roleTitle" className="flex-1 text-[16px] text-brand-heading">
                  Payment Matrix
                </Typography>
              </View>

              <Typography
                variant="roleDescription"
                className="text-[13px] leading-[20px] text-brand-body"
              >
                {PAYMENT_MATRIX_INFO}
              </Typography>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Got it"
                className="mt-5 h-11 items-center justify-center rounded-xl bg-brand-heading"
              >
                <Typography variant="button" className="text-[14px] tracking-normal">
                  Got it
                </Typography>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});

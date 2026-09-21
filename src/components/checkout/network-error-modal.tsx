import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { DialogShell } from '@/components/ui/app-dialog';
import { Typography } from '@/components/ui/typography';
import { AlertCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type NetworkErrorModalProps = {
  visible: boolean;
  title?: string;
  message?: string;
  onRetry: () => void;
  onClose: () => void;
  retrying?: boolean;
};

export const NetworkErrorModal = memo(function NetworkErrorModal({
  visible,
  title = 'Unable to refresh pricing',
  message = 'Unable to refresh pricing. Please check your connection and try again.',
  onRetry,
  onClose,
  retrying = false,
}: NetworkErrorModalProps) {
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
        onPress={onRetry}
        disabled={retrying}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        className="mt-xl h-12 items-center justify-center rounded-2xl bg-brand-heading"
        style={({ pressed }) => ({ opacity: retrying ? 0.7 : pressed ? 0.88 : 1 })}
      >
        <Typography variant="button" className="text-[15px] tracking-normal text-brand-white">
          {retrying ? 'Retrying...' : 'Retry'}
        </Typography>
      </Pressable>
    </DialogShell>
  );
});

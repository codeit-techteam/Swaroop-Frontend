import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { DialogShell } from '@/components/ui/app-dialog';
import { Typography } from '@/components/ui/typography';
import { ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type QuoteExpiredModalProps = {
  visible: boolean;
  onRefresh: () => void;
  onClose: () => void;
  refreshing?: boolean;
};

export const QuoteExpiredModal = memo(function QuoteExpiredModal({
  visible,
  onRefresh,
  onClose,
  refreshing = false,
}: QuoteExpiredModalProps) {
  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFF4E5]">
          <ClockIcon size={iconSizes.xl} color="#B45309" />
        </View>
        <Typography variant="heading" className="mt-lg text-[20px] leading-[26px]">
          Price Quote Expired
        </Typography>
        <Typography variant="subheading" className="mt-sm text-[14px] leading-[21px]">
          Pricing has been refreshed because the previous quote is no longer valid.
        </Typography>
      </View>
      <Pressable
        onPress={onRefresh}
        disabled={refreshing}
        accessibilityRole="button"
        accessibilityLabel="Refresh pricing"
        className="mt-xl h-12 items-center justify-center rounded-2xl bg-brand-heading"
        style={({ pressed }) => ({ opacity: refreshing ? 0.7 : pressed ? 0.88 : 1 })}
      >
        <Typography variant="button" className="text-[15px] tracking-normal text-brand-white">
          {refreshing ? 'Refreshing...' : 'Refresh Pricing'}
        </Typography>
      </Pressable>
    </DialogShell>
  );
});

import { memo } from 'react';

import { Modal, Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { getPriceHistory } from '@/seller/modules/seller-offers/services/sellerOffersService';
import { cn } from '@/utils/cn';

export const PriceHistorySheet = memo(function PriceHistorySheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const history = getPriceHistory();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg" onPress={() => undefined}>
          <View className="mb-lg h-1 w-12 self-center rounded-full bg-brand-border" />
          <View className="flex-row items-center gap-sm">
            <ClockIcon size={18} color={brandColors.heading} />
            <Typography variant="headingLeft" className="text-[22px]">
              Price History
            </Typography>
          </View>

          {history.map((entry) => (
            <View
              key={entry.id}
              className="mt-md flex-row items-center justify-between rounded-2xl border border-brand-border px-md py-md"
            >
              <View>
                <Typography variant="roleTitle">{entry.label}</Typography>
                <Typography variant="roleDescription" className="mt-xs">
                  {entry.value}
                </Typography>
              </View>
              <Typography
                variant="badge"
                className={cn(
                  entry.trend === 'up'
                    ? 'text-brand-success'
                    : entry.trend === 'down'
                      ? 'text-brand-error'
                      : 'text-brand-body',
                )}
              >
                {entry.delta}
              </Typography>
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
});

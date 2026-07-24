import { memo, useCallback, useState } from 'react';

import { Modal, Pressable, ScrollView } from 'react-native';

import { Typography } from '@/components/ui';
import {
  inferOrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SEQUENCE,
} from '@/constants/orderWorkflow';
import { selectCurrentOrder, useOrderStore } from '@/store/order-store';
import type { OrderStatus } from '@/types/orderStatus';
import { brandColors } from '@/theme/colors';

/** Dev-only floating control to manually advance order status for frontend testing. */
export const OrderSimulator = memo(function OrderSimulator() {
  const [visible, setVisible] = useState(false);
  const currentOrder = useOrderStore(selectCurrentOrder);
  const setOrderStatus = useOrderStore((state) => state.setOrderStatus);

  const currentStatus = currentOrder ? inferOrderStatus(currentOrder) : null;

  const handleSelectStatus = useCallback(
    (status: OrderStatus) => {
      if (!currentOrder) {
        return;
      }
      setOrderStatus(status);
    },
    [currentOrder, setOrderStatus],
  );

  if (!__DEV__) {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Open order simulator"
        className="absolute bottom-24 right-4 z-50 rounded-full bg-brand-heading px-md py-sm shadow-lg"
        style={{ elevation: 6 }}
      >
        <Typography variant="fieldLabel" className="text-[10px] text-brand-white">
          Order Simulator
        </Typography>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="max-h-[70%] rounded-t-2xl bg-brand-white px-lg pb-xl pt-lg"
            onPress={(event) => event.stopPropagation()}
          >
            <Typography variant="headingLeft" className="text-[18px] text-brand-heading">
              Order Simulator
            </Typography>
            <Typography variant="subheadingLeft" className="mt-xs text-[13px] text-brand-muted">
              {currentOrder
                ? `Order ${currentOrder.id.replace(/^PT-ORD-/, '#ORD-')}`
                : 'No active order — create one via checkout'}
            </Typography>

            <ScrollView className="mt-lg" showsVerticalScrollIndicator={false}>
              {ORDER_STATUS_SEQUENCE.map((status) => {
                const isCurrent = status === currentStatus;
                const isDisabled = !currentOrder;

                return (
                  <Pressable
                    key={status}
                    disabled={isDisabled}
                    onPress={() => handleSelectStatus(status)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isCurrent, disabled: isDisabled }}
                    className="mb-sm flex-row items-center justify-between rounded-xl border px-md py-md"
                    style={{
                      borderColor: isCurrent ? brandColors.primary : brandColors.border,
                      backgroundColor: isCurrent ? brandColors.primaryTint : brandColors.white,
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                  >
                    <Typography
                      variant="roleTitle"
                      className="text-[14px]"
                      style={{ color: isCurrent ? brandColors.primary : brandColors.heading }}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </Typography>
                    {isCurrent ? (
                      <Typography variant="fieldLabel" className="text-[11px] text-brand-primary">
                        Current
                      </Typography>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => setVisible(false)}
              className="mt-md items-center rounded-xl border border-brand-border py-md"
            >
              <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                Close
              </Typography>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});

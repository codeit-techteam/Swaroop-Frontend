import { memo } from 'react';

import { Modal, Pressable, TextInput, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import type { SellerRejectReason } from '@/seller/modules/seller-orders/types/sellerOrders';

export const ConfirmationBottomSheet = memo(function ConfirmationBottomSheet({
  visible,
  title,
  message,
  confirmLabel = 'Accept',
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onCancel}>
        <Pressable className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg" onPress={() => undefined}>
          <View className="mb-lg h-1 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="text-[22px]">
            {title}
          </Typography>
          <Typography variant="subheading" className="mt-sm text-brand-body">
            {message}
          </Typography>
          <View className="mt-xl flex-row gap-sm">
            <View className="flex-1">
              <SecondaryButton label="Cancel" variant="outline" onPress={onCancel} />
            </View>
            <View className="flex-1">
              <PrimaryButton label={confirmLabel} onPress={onConfirm} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const REJECTION_REASONS: SellerRejectReason[] = [
  'Insufficient Inventory',
  'Price Mismatch',
  'Quality Issue',
  'Cannot Deliver',
  'Other',
];

export const RejectReasonSheet = memo(function RejectReasonSheet({
  visible,
  reason,
  remarks,
  onReasonChange,
  onRemarksChange,
  onCancel,
  onReject,
}: {
  visible: boolean;
  reason: SellerRejectReason;
  remarks: string;
  onReasonChange: (reason: SellerRejectReason) => void;
  onRemarksChange: (remarks: string) => void;
  onCancel: () => void;
  onReject: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onCancel}>
        <Pressable className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg" onPress={() => undefined}>
          <View className="mb-lg h-1 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="text-[22px]">
            Reject Order
          </Typography>
          <Typography variant="subheading" className="mt-sm text-brand-body">
            Select a reason and add remarks for the buyer.
          </Typography>

          <View className="mt-lg">
            {REJECTION_REASONS.map((item) => {
              const selected = item === reason;
              return (
                <Pressable
                  key={item}
                  onPress={() => onReasonChange(item)}
                  className="mb-sm flex-row items-center rounded-xl border border-brand-border px-md py-md"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.9 : 1,
                    backgroundColor: selected ? '#EEF4FF' : '#FFFFFF',
                  })}
                >
                  <View
                    className="mr-md h-5 w-5 items-center justify-center rounded-full border-2"
                    style={{ borderColor: selected ? '#1D4ED8' : '#D1D5DB' }}
                  >
                    {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#1D4ED8]" /> : null}
                  </View>
                  <Typography variant="roleDescription">{item}</Typography>
                </Pressable>
              );
            })}
          </View>

          <Typography variant="fieldLabel" className="mt-md">
            Remarks
          </Typography>
          <TextInput
            value={remarks}
            onChangeText={onRemarksChange}
            placeholder="Add rejection remarks..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            className="mt-sm min-h-[96px] rounded-xl border border-brand-border bg-brand-surface px-md py-md font-sans text-[15px] text-brand-heading"
            textAlignVertical="top"
          />

          <View className="mt-xl">
            <PrimaryButton label="Reject Order" onPress={onReject} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

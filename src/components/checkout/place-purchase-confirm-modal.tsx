import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { DialogShell } from '@/components/ui/app-dialog';
import { Typography } from '@/components/ui/typography';
import { TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

type PlacePurchaseConfirmModalProps = {
  visible: boolean;
  totalAmount: string;
  paymentLabel: string;
  productName: string;
  quantity: string;
  unit: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const PlacePurchaseConfirmModal = memo(function PlacePurchaseConfirmModal({
  visible,
  totalAmount,
  paymentLabel,
  productName,
  quantity,
  unit,
  loading = false,
  onCancel,
  onConfirm,
}: PlacePurchaseConfirmModalProps) {
  return (
    <DialogShell visible={visible} onClose={onCancel}>
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary-tint">
          <TruckIcon size={iconSizes.xl} color={brandColors.navy} />
        </View>
        <Typography variant="heading" className="mt-lg text-[20px] leading-[26px]">
          Confirm purchase request
        </Typography>
        <Typography variant="subheading" className="mt-sm text-center text-[14px] leading-[21px]">
          Review the payable amount before submitting. This step is separate from Proceed to Checkout
          in your cart.
        </Typography>
      </View>
      <View className="mt-lg rounded-2xl border border-brand-border bg-brand-surface px-md py-md">
        <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
          {productName}
        </Typography>
        <Typography variant="roleDescription" className="mt-xs text-[13px] text-brand-body">
          {quantity} {unit} · {paymentLabel}
        </Typography>
        <Typography variant="roleTitle" className="mt-md text-[17px] text-brand-navy">
          Total payable {totalAmount}
        </Typography>
      </View>
      <View className="mt-lg flex-row gap-sm">
        <Pressable
          onPress={onCancel}
          disabled={loading}
          accessibilityRole="button"
          className="h-12 flex-1 items-center justify-center rounded-2xl border border-brand-border bg-brand-white"
        >
          <Typography variant="button" className="text-[14px] text-brand-heading">
            Go back
          </Typography>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={loading}
          accessibilityRole="button"
          className="h-12 flex-1 items-center justify-center rounded-2xl bg-brand-heading"
          style={({ pressed }) => ({ opacity: loading || !pressed ? 1 : 0.88 })}
        >
          <Typography variant="button" className="text-[14px] text-brand-white">
            {loading ? 'Submitting…' : 'Confirm & submit'}
          </Typography>
        </Pressable>
      </View>
    </DialogShell>
  );
});

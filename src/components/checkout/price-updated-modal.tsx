import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { DialogShell } from '@/components/ui/app-dialog';
import { Typography } from '@/components/ui/typography';
import { formatPricePerMt } from '@/constants/cart';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { CartPriceChange } from '@/types/checkout-quote';

type PriceUpdatedModalProps = {
  visible: boolean;
  changes: CartPriceChange[];
  onReview: () => void;
  onContinue?: () => void;
  onClose: () => void;
};

export const PriceUpdatedModal = memo(function PriceUpdatedModal({
  visible,
  changes,
  onReview,
  onContinue,
  onClose,
}: PriceUpdatedModalProps) {
  const primary = changes[0];

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View className="items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary-light">
          <InfoIcon size={iconSizes.xl} color={brandColors.primaryDark} />
        </View>
        <Typography variant="heading" className="mt-lg text-[20px] leading-[26px]">
          Price Updated
        </Typography>
        <Typography variant="subheading" className="mt-sm text-[14px] leading-[21px]">
          The latest PetroTrade price for this product has changed. Your cart has been updated with
          the current market price.
        </Typography>
      </View>

      {primary ? (
        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-surface px-md py-md">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            {primary.productName}
          </Typography>
          {primary.gradeName ? (
            <Typography variant="caption" className="mt-xs text-[11px] text-brand-muted">
              {primary.gradeName}
            </Typography>
          ) : null}
          <View className="mt-md flex-row items-center justify-between">
            <View>
              <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
                Previous
              </Typography>
              <Typography variant="roleDescription" className="mt-xs text-[13px] text-brand-body">
                {formatPricePerMt(primary.oldUnitPrice)}
              </Typography>
            </View>
            <View className="items-end">
              <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
                Current
              </Typography>
              <Typography variant="roleTitle" className="mt-xs text-[13px] text-brand-primary">
                {formatPricePerMt(primary.newUnitPrice)}
              </Typography>
            </View>
          </View>
        </View>
      ) : null}

      <View className="mt-xl" style={{ gap: 10 }}>
        <Pressable
          onPress={onReview}
          accessibilityRole="button"
          accessibilityLabel="Review updated price"
          className="h-12 items-center justify-center rounded-2xl bg-brand-heading"
          style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
        >
          <Typography variant="button" className="text-[15px] tracking-normal text-brand-white">
            Review Updated Price
          </Typography>
        </Pressable>
        {onContinue ? (
          <Pressable
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to checkout"
            className="h-12 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface"
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
              Continue to Checkout
            </Typography>
          </Pressable>
        ) : null}
      </View>
    </DialogShell>
  );
});

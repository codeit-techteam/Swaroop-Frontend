import { memo, useEffect, useState } from 'react';

import { Modal, Pressable, TextInput, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { createTierFromInput } from '@/seller/modules/seller-offers/services/sellerOffersService';
import type { OfferPricingTier } from '@/seller/modules/seller-offers/types/offers';

export const TierBottomSheet = memo(function TierBottomSheet({
  visible,
  basePrice,
  onClose,
  onSave,
}: {
  visible: boolean;
  basePrice: number;
  onClose: () => void;
  onSave: (tier: OfferPricingTier) => void;
}) {
  const [minQty, setMinQty] = useState('10');
  const [maxQty, setMaxQty] = useState('50');
  const [discount, setDiscount] = useState('2');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }
    const discountValue = Number(discount) || 0;
    const computed = basePrice * (1 - discountValue / 100);
    setPrice(computed.toFixed(2));
  }, [basePrice, discount, visible]);

  const handleSave = () => {
    const tier = createTierFromInput(
      basePrice,
      Number(minQty) || 0,
      maxQty.trim() ? Number(maxQty) : null,
      Number(discount) || 0,
    );
    if (price.trim()) {
      tier.pricePerKg = Number(price);
    }
    onSave(tier);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg" onPress={() => undefined}>
          <View className="mb-lg h-1 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="text-[22px]">
            Add Pricing Tier
          </Typography>

          <TierField label="Minimum Quantity (MT)" value={minQty} onChangeText={setMinQty} />
          <TierField label="Maximum Quantity (MT)" value={maxQty} onChangeText={setMaxQty} />
          <TierField label="Discount (%)" value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" />
          <TierField label="Price (₹/kg)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

          <View className="mt-xl flex-row gap-sm">
            <View className="flex-1">
              <SecondaryButton label="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View className="flex-1">
              <PrimaryButton label="Add Tier" onPress={handleSave} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const TierField = ({
  label,
  value,
  onChangeText,
  keyboardType = 'number-pad',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'number-pad' | 'decimal-pad';
}) => (
  <View className="mt-md">
    <Typography variant="fieldLabel">{label}</Typography>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      className="mt-sm rounded-xl border border-brand-border bg-brand-surface px-md py-md font-sans text-[15px] text-brand-heading"
    />
  </View>
);

export const DeleteOfferBottomSheet = memo(function DeleteOfferBottomSheet({
  visible,
  offerLabel,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  offerLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onCancel}>
        <Pressable className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg" onPress={() => undefined}>
          <View className="mb-lg h-1 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="text-[22px]">
            Delete Offer
          </Typography>
          <Typography variant="subheading" className="mt-sm text-brand-body">
            Are you sure you want to delete {offerLabel}? This action cannot be undone.
          </Typography>
          <View className="mt-xl flex-row gap-sm">
            <View className="flex-1">
              <SecondaryButton label="Cancel" variant="outline" onPress={onCancel} />
            </View>
            <View className="flex-1">
              <PrimaryButton label="Delete" onPress={onConfirm} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

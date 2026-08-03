import { memo } from 'react';

import { View } from 'react-native';

import { SecondaryButton, Typography } from '@/components';
import type { OfferEditorForm } from '@/seller/modules/seller-offers/types/offers';

export const BuyerPreviewCard = memo(function BuyerPreviewCard({
  form,
}: {
  form: OfferEditorForm;
}) {
  const basePrice = Number(form.basePrice) || 0;

  return (
    <View className="rounded-2xl border border-dashed border-brand-border bg-brand-white px-md py-md">
      <Typography variant="badge" className="text-[11px] text-brand-body">
        LIVE PREVIEW - HOW BUYERS SEE THIS
      </Typography>

      <View className="mt-md rounded-2xl border border-brand-border bg-brand-white p-md">
        <View className="flex-row items-start justify-between gap-sm">
          <Typography variant="roleTitle" className="flex-1 text-brand-heading">
            {form.product || form.productGrade}
          </Typography>
          <View className="rounded-full bg-brand-success-light px-sm py-xs">
            <Typography variant="badge" className="text-[10px] text-brand-success">
              Lowest Landed Cost
            </Typography>
          </View>
        </View>

        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          {form.warehouseLocation} • Prime Grade
        </Typography>

        <Typography variant="headingLeft" className="mt-md text-[28px] text-brand-navy">
          ₹{basePrice.toFixed(2)}
          <Typography variant="roleDescription" className="text-brand-body">
            {' '}
            / kg + GST
          </Typography>
        </Typography>

        {form.tiers.length > 0 ? (
          <View className="mt-md rounded-xl bg-brand-surface p-md">
            <Typography variant="roleTitle" className="mb-sm text-[13px]">
              Volume Discounts
            </Typography>
            {form.tiers.map((tier) => (
              <View key={tier.id} className="mb-xs flex-row items-center justify-between">
                <Typography variant="roleDescription">{tier.label}</Typography>
                <Typography variant="roleTitle">₹{tier.pricePerKg.toFixed(2)}</Typography>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-md">
          <SecondaryButton label="Request Quote" variant="outline" onPress={() => undefined} />
        </View>
      </View>

      <Typography variant="legal" className="mt-md text-center text-brand-body">
        Buyer view is updated in real-time as you type
      </Typography>
    </View>
  );
});

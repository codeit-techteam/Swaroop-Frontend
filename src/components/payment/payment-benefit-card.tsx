import { memo } from 'react';

import { View } from 'react-native';

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { elevation } from '@/theme/shadows';
import type { PaymentComparisonOption } from '@/types/payment';

type PaymentBenefitCardProps = {
  option: PaymentComparisonOption;
};

export const PaymentBenefitCard = memo(function PaymentBenefitCard({
  option,
}: PaymentBenefitCardProps) {
  return (
    <Animated.View
      key={option.id}
      entering={FadeIn.duration(280)}
      exiting={FadeOut.duration(160)}
      className="rounded-2xl border border-brand-border bg-brand-white px-4 py-4"
      style={elevation.sm}
    >
      <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
        {option.title}
      </Typography>

      <Typography
        variant="roleDescription"
        className="mt-1 text-[12px] leading-[18px] text-brand-body"
      >
        {option.description}
      </Typography>

      <View className="mt-3" style={{ gap: 10 }}>
        {option.benefits.map((benefit) => (
          <View key={benefit} className="flex-row items-start">
            <Typography
              variant="success"
              className="mr-2 text-[13px] font-semibold text-brand-success"
            >
              ✔
            </Typography>
            <Typography
              variant="roleDescription"
              className="flex-1 text-[13px] leading-[18px] text-brand-heading"
            >
              {benefit}
            </Typography>
          </View>
        ))}
      </View>

      <View className="mt-3 self-start rounded-full bg-brand-primary-tint px-2.5 py-1">
        <Typography variant="badge" className="text-[9px] tracking-[0.4px] text-brand-badge-text">
          {option.risk}
        </Typography>
      </View>
    </Animated.View>
  );
});

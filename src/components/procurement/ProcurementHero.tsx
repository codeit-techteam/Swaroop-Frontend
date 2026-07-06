import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { ProcurementIllustration } from '@/icons/procurement-illustration';
import { cn } from '@/utils/cn';

type ProcurementHeroProps = {
  className?: string;
};

export const ProcurementHero = memo(function ProcurementHero({ className }: ProcurementHeroProps) {
  return (
    <View className={cn('items-center', className)}>
      <View className="w-full items-center rounded-2xl border border-brand-border bg-brand-white px-md py-lg">
        <ProcurementIllustration width={220} height={160} />
      </View>

      <Typography
        variant="headingLeft"
        className="mt-xl text-center text-[22px] text-brand-heading"
      >
        {PROCUREMENT_SCREEN_COPY.heroTitle}
      </Typography>
      <Typography
        variant="subheadingLeft"
        className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
      >
        {PROCUREMENT_SCREEN_COPY.heroSubtitle}
      </Typography>
    </View>
  );
});

import { memo } from 'react';

import { type GestureResponderEvent, View } from 'react-native';

import { PrimaryCTAButton } from '@/components/home/primary-cta-button';
import { StatCard } from '@/components/home/stat-card';
import { Typography } from '@/components/ui/typography';
import { LOWEST_LANDED_COST } from '@/constants/dashboard';
import { SavingsArrowIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { LowestLandedCost } from '@/types/home';
import { cn } from '@/utils/cn';

type LowestCostCardProps = {
  data?: LowestLandedCost;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
};

export const LowestCostCard = memo(function LowestCostCard({
  data = LOWEST_LANDED_COST,
  onPress,
  className,
}: LowestCostCardProps) {
  return (
    <View className={cn('mx-lg overflow-hidden rounded-xl bg-brand-card-blue p-lg', className)}>
      <View className="mb-md flex-row items-start justify-between">
        <View className="rounded-full bg-white/20 px-md py-xs">
          <Typography variant="badge" className="text-[9px] tracking-[0.8px] text-brand-white">
            {data.badge}
          </Typography>
        </View>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <ShieldCheckIcon color={brandColors.white} />
        </View>
      </View>

      <Typography variant="headingLeft" className="text-[22px] text-brand-white">
        {data.title}
      </Typography>
      <Typography
        variant="subheadingLeft"
        className="mt-sm text-[13px] leading-[20px] text-brand-white/90"
      >
        {data.description}
      </Typography>

      <View className="mt-lg flex-row gap-md">
        <StatCard label="EST. TOTAL" value={data.estimatedTotal} />
        <StatCard
          label="TOTAL SAVINGS"
          value={data.totalSavings}
          trailing={<SavingsArrowIcon color={brandColors.white} />}
        />
      </View>

      <PrimaryCTAButton label={data.ctaLabel} onPress={onPress} className="mt-lg" />
    </View>
  );
});

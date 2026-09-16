import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { BuildingIcon, ClockIcon, LocationPinIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { LogisticsEstimate } from '@/types/product';
import { cn } from '@/utils/cn';

type DeliveryCardProps = {
  origin: string;
  eta: string;
  logistics: LogisticsEstimate;
  className?: string;
};

export const DeliveryCard = memo(function DeliveryCard({
  origin,
  eta,
  logistics,
  className,
}: DeliveryCardProps) {
  const rows = [
    { label: 'Origin', value: origin, icon: LocationPinIcon },
    { label: 'Dispatch', value: '24 Hours', icon: ClockIcon },
    {
      label: 'Estimated Delivery',
      value: logistics.estimatedDelivery || eta,
      icon: TruckIcon,
    },
    { label: 'Warehouse', value: logistics.warehouse, icon: BuildingIcon },
  ];

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="mb-md text-[16px] text-brand-heading">
        Delivery
      </Typography>
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <View
              key={row.label}
              className="min-w-[46%] flex-1 rounded-lg bg-brand-surface px-md py-md"
              style={{ flexBasis: '46%' }}
            >
              <View className="flex-row items-center">
                <Icon size={iconSizes.sm} color={brandColors.primary} />
                <Typography
                  variant="fieldLabel"
                  className="ml-xs text-[10px] tracking-[0.8px] text-brand-muted"
                >
                  {row.label}
                </Typography>
              </View>
              <Typography
                variant="roleTitle"
                className="mt-xs text-[13px] text-brand-heading"
                numberOfLines={2}
              >
                {row.value}
              </Typography>
            </View>
          );
        })}
      </View>
    </View>
  );
});

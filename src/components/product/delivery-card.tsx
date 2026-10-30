import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { BuildingIcon, ClockIcon, LocationPinIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import {
  deliveryEstimateCopy,
  dispatchWindowCopy,
  fulfilmentWarehouseCopy,
  type FulfilmentInfo,
} from '@/types/fulfilment';
import { cn } from '@/utils/cn';

type DeliveryCardProps = {
  fulfilment: FulfilmentInfo | null;
  availabilityLabel?: string;
  destinationPincode?: string | null;
  onRequestPincode?: () => void;
  className?: string;
};

export const DeliveryCard = memo(function DeliveryCard({
  fulfilment,
  availabilityLabel,
  destinationPincode,
  onRequestPincode,
  className,
}: DeliveryCardProps) {
  const estimate = deliveryEstimateCopy({ fulfilment, destinationPincode });
  const warehouse = fulfilmentWarehouseCopy(fulfilment);
  const dispatch = dispatchWindowCopy(fulfilment);

  const rows = [
    { label: 'Dispatch within', value: dispatch, icon: ClockIcon },
    { label: 'Estimated delivery', value: estimate.label, icon: TruckIcon },
    ...(warehouse ? [{ label: 'Fulfilment warehouse', value: warehouse, icon: BuildingIcon }] : []),
    ...(availabilityLabel
      ? [{ label: 'Availability', value: availabilityLabel, icon: LocationPinIcon }]
      : []),
  ];

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="mb-xs text-[16px] text-brand-heading">
        Delivery & fulfilment
      </Typography>
      <Typography
        variant="caption"
        className="mb-md font-sans text-[12px] normal-case tracking-normal text-brand-muted"
      >
        Dispatch is when material leaves the warehouse. Delivery is the estimated transit window.
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
                numberOfLines={3}
              >
                {row.value}
              </Typography>
            </View>
          );
        })}
      </View>
      {estimate.status === 'need_pincode' && onRequestPincode ? (
        <Pressable
          onPress={onRequestPincode}
          accessibilityRole="button"
          accessibilityLabel="Enter delivery pincode"
          className="mt-md h-10 items-center justify-center rounded-lg border border-brand-border"
        >
          <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
            Enter delivery pincode
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});

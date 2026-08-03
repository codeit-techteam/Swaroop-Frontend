import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { BuildingIcon, ClockIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

import { StatusBadge } from '@/seller/components/shipments/StatusBadge';
import type { ActiveShipment } from '@/seller/types/shipments';

type ShipmentCardProps = {
  shipment: ActiveShipment;
  onPress?: () => void;
};

export const ShipmentCard = memo(function ShipmentCard({ shipment, onPress }: ShipmentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-brand-border bg-brand-white px-lg py-lg"
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className="flex-row items-start justify-between">
        <View>
          <Typography variant="legal" className="text-left text-brand-body">
            Order ID
          </Typography>
          <Typography variant="roleTitle" className="mt-0.5 text-[16px] text-brand-heading">
            {shipment.orderId}
          </Typography>
        </View>
        <StatusBadge status={shipment.status} />
      </View>

      <View className="mt-md gap-sm">
        {shipment.buyer ? (
          <View className="flex-row items-center gap-sm">
            <BuildingIcon size={14} color={brandColors.body} />
            <Typography variant="roleDescription">{shipment.buyer}</Typography>
          </View>
        ) : null}
        <View className="flex-row items-center gap-sm">
          <TruckIcon size={14} color={brandColors.body} />
          <Typography variant="roleDescription">{shipment.vehicle}</Typography>
        </View>
        <View className="flex-row items-center gap-sm">
          <ClockIcon size={14} color={brandColors.body} />
          <Typography variant="roleDescription">{shipment.etaLabel}</Typography>
        </View>
      </View>

      <View className="mt-md h-1.5 overflow-hidden rounded-full bg-brand-surface">
        <View
          className="h-full rounded-full bg-brand-navy"
          style={{ width: `${shipment.progress}%` }}
        />
      </View>
    </Pressable>
  );
});

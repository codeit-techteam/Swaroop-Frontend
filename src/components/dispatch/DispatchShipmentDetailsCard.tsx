import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DISPATCH_STARTED_COPY } from '@/constants/dispatchStarted';
import type { DispatchShipmentDetails } from '@/types/order';
import { LocationPinIcon, PhoneIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DispatchShipmentDetailsCardProps = {
  orderId: string;
  product: string;
  quantityMt: number;
  warehouse: string;
  destination: string;
  shipmentDetails: DispatchShipmentDetails;
  className?: string;
};

type DetailRowProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

const DetailRow = memo(function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <View className="flex-row items-start justify-between py-sm">
      <View className="flex-row items-center gap-sm">
        {icon}
        <Typography variant="fieldLabel" className="text-[12px] text-brand-muted">
          {label}
        </Typography>
      </View>
      <Typography
        variant="roleTitle"
        className="max-w-[55%] text-right text-[13px] text-brand-heading"
        numberOfLines={2}
      >
        {value}
      </Typography>
    </View>
  );
});

export const DispatchShipmentDetailsCard = memo(function DispatchShipmentDetailsCard({
  orderId,
  product,
  quantityMt,
  warehouse,
  destination,
  shipmentDetails,
  className,
}: DispatchShipmentDetailsCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="mb-md flex-row items-center gap-sm rounded-lg bg-brand-primary-tint px-md py-sm">
        <TruckIcon size={iconSizes.sm} color={brandColors.primary} />
        <Typography
          variant="fieldLabel"
          className="text-[10px] tracking-[0.8px] text-brand-primary"
        >
          {DISPATCH_STARTED_COPY.shipmentDetailsHeading}
        </Typography>
      </View>

      <DetailRow label="Order ID" value={orderId} />
      <View className="h-px bg-brand-border" />
      <DetailRow label="Product" value={product} />
      <View className="h-px bg-brand-border" />
      <DetailRow label="Quantity" value={`${quantityMt} MT`} />
      <View className="h-px bg-brand-border" />
      <DetailRow
        label="Warehouse"
        value={warehouse}
        icon={<LocationPinIcon size={iconSizes.sm} color={brandColors.muted} />}
      />
      <View className="h-px bg-brand-border" />
      <DetailRow
        label="Destination"
        value={destination}
        icon={<LocationPinIcon size={iconSizes.sm} color={brandColors.muted} />}
      />
      <View className="h-px bg-brand-border" />
      <DetailRow label="Vehicle Number" value={shipmentDetails.vehicleNumber} />
      <View className="h-px bg-brand-border" />
      <DetailRow label="Driver Name" value={shipmentDetails.driverName} />
      <View className="h-px bg-brand-border" />
      <DetailRow
        label="Driver Contact"
        value={shipmentDetails.driverContactMasked}
        icon={<PhoneIcon size={iconSizes.sm} color={brandColors.muted} />}
      />
      <View className="h-px bg-brand-border" />
      <DetailRow
        label="Transport Partner"
        value={DISPATCH_STARTED_COPY.transportPartner}
      />
    </View>
  );
});

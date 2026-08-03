import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DELIVERY_COMPLETED_COPY } from '@/constants/deliveryCompleted';
import type { Order } from '@/types/order';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DeliveryInformationCardProps = {
  order: Order;
  className?: string;
};

type DetailFieldProps = {
  label: string;
  value: string;
};

const DetailField = memo(function DetailField({ label, value }: DetailFieldProps) {
  return (
    <View className="min-w-[45%] flex-1">
      <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
        {value}
      </Typography>
    </View>
  );
});

const StatusBadge = memo(function StatusBadge({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full bg-brand-success-light px-sm py-xs">
      <Typography variant="badge" className="text-[10px] text-brand-success">
        {label}
      </Typography>
    </View>
  );
});

export const DeliveryInformationCard = memo(function DeliveryInformationCard({
  order,
  className,
}: DeliveryInformationCardProps) {
  const vehicleNumber =
    order.shipmentDetails?.vehicleNumber ??
    order.loadingSchedule?.vehicleNumber ??
    order.loadingProof?.truckNumber ??
    '—';

  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
        {DELIVERY_COMPLETED_COPY.deliveryInfoHeading}
      </Typography>

      <View className="mt-lg flex-row flex-wrap" style={{ gap: 16 }}>
        <DetailField label="Order ID" value={order.id} />
        <DetailField label="Product Name" value={order.productName} />
        <DetailField label="Grade" value={order.grade || '—'} />
        <DetailField label="Quantity" value={`${order.quantityMt} MT`} />
        <DetailField label="Warehouse" value={order.warehouse} />
        <DetailField label="Destination" value={order.destination} />
        <DetailField label="Vehicle Number" value={vehicleNumber} />
        <DetailField
          label="Delivery Date"
          value={order.deliveryDetails?.deliveryDate ?? '—'}
        />
        <DetailField
          label="Delivery Time"
          value={order.deliveryDetails?.deliveryTime ?? '—'}
        />
      </View>

      <View className="mt-lg">
        <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
          Delivery Status
        </Typography>
        <View className="mt-sm">
          <StatusBadge label="Delivered" />
        </View>
      </View>
    </View>
  );
});

import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DELIVERY_COMPLETED_COPY } from '@/constants/deliveryCompleted';
import type { DeliveryReceiverDetails } from '@/types/delivery';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type ReceiverDetailsCardProps = {
  receiver: DeliveryReceiverDetails;
  className?: string;
};

type DetailFieldProps = {
  label: string;
  value: string;
};

const DetailField = memo(function DetailField({ label, value }: DetailFieldProps) {
  return (
    <View className="mb-md">
      <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
        {value}
      </Typography>
    </View>
  );
});

export const ReceiverDetailsCard = memo(function ReceiverDetailsCard({
  receiver,
  className,
}: ReceiverDetailsCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
        {DELIVERY_COMPLETED_COPY.receiverHeading}
      </Typography>

      <View className="mt-lg">
        <DetailField label="Receiver Name" value={receiver.receiverName} />
        <DetailField label="Receiver Mobile" value={receiver.receiverMobileMasked} />
        <DetailField label="Company Name" value={receiver.companyName} />
        <DetailField label="Delivery Address" value={receiver.deliveryAddress} />
      </View>

      <View>
        <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
          Signature Status
        </Typography>
        <View className="mt-sm self-start rounded-full bg-brand-success-light px-sm py-xs">
          <Typography variant="badge" className="text-[10px] text-brand-success">
            {DELIVERY_COMPLETED_COPY.signedLabel}
          </Typography>
        </View>
      </View>
    </View>
  );
});

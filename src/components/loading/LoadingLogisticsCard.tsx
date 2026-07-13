import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { LOADING_LOGISTICS_LABELS, LOADING_WORKFLOW_COPY } from '@/constants/loadingWorkflow';
import { TruckIcon } from '@/icons';
import type { LoadingScheduleDetails } from '@/types/loading';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type LoadingLogisticsCardProps = {
  schedule: LoadingScheduleDetails;
  orderId: string;
  className?: string;
};

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow = memo(function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-start justify-between py-sm">
      <Typography variant="fieldLabel" className="text-[12px] text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="max-w-[58%] text-right text-[13px] text-brand-heading">
        {value}
      </Typography>
    </View>
  );
});

export const LoadingLogisticsCard = memo(function LoadingLogisticsCard({
  schedule,
  orderId,
  className,
}: LoadingLogisticsCardProps) {
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
          {LOADING_WORKFLOW_COPY.scheduled.logisticsHeading}
        </Typography>
      </View>

      <View className="mb-sm flex-row items-center gap-xs">
        <CheckIcon />
        <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
          {LOADING_LOGISTICS_LABELS.truckAllocated}
        </Typography>
      </View>

      <View className="mb-md flex-row items-center gap-xs">
        <CheckIcon />
        <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
          {LOADING_LOGISTICS_LABELS.warehouseAssigned}
        </Typography>
      </View>

      <DetailRow label={LOADING_LOGISTICS_LABELS.warehouse} value={schedule.warehouseName} />
      <View className="h-px bg-brand-border" />
      <DetailRow label={LOADING_LOGISTICS_LABELS.loadingBay} value={schedule.loadingBayNumber} />
      <View className="h-px bg-brand-border" />
      <DetailRow label={LOADING_LOGISTICS_LABELS.loadingSlot} value={schedule.loadingSlot} />
      <View className="h-px bg-brand-border" />
      <DetailRow
        label={LOADING_LOGISTICS_LABELS.expectedTime}
        value={schedule.expectedLoadingTime}
      />
      <View className="h-px bg-brand-border" />
      <DetailRow label={LOADING_LOGISTICS_LABELS.loadingTeam} value={schedule.loadingTeam} />
      <View className="h-px bg-brand-border" />
      <DetailRow
        label={LOADING_LOGISTICS_LABELS.vehicleNumber}
        value={schedule.vehicleNumber}
      />

      <Typography variant="fieldLabel" className="mt-md text-[10px] text-brand-muted">
        Order Reference: {orderId}
      </Typography>
    </View>
  );
});

const CheckIcon = memo(function CheckIcon() {
  return (
    <View className="h-5 w-5 items-center justify-center rounded-full bg-brand-success-light">
      <Typography variant="badge" className="text-[10px] text-brand-success">
        ✓
      </Typography>
    </View>
  );
});

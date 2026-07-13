import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { formatFinalWeight, LOADING_WORKFLOW_COPY } from '@/constants/loadingWorkflow';
import { CheckCircleIcon, LocationPinIcon, TruckIcon } from '@/icons';
import type { LoadingProofState } from '@/types/loading';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type LoadingFinalWeightCardProps = {
  proof: LoadingProofState;
  className?: string;
};

type DetailRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
};

const DetailRow = memo(function DetailRow({ icon, label, value, highlight }: DetailRowProps) {
  return (
    <View className="flex-row items-center gap-sm py-sm">
      {icon}
      <View className="min-w-0 flex-1">
        <Typography variant="fieldLabel" className="text-[11px] text-brand-muted">
          {label}
        </Typography>
        {highlight ? (
          <View className="mt-xs self-start rounded-md bg-brand-primary-tint px-sm py-xs">
            <Typography variant="roleTitle" className="text-[12px] text-brand-primary">
              {value}
            </Typography>
          </View>
        ) : (
          <Typography variant="roleTitle" className="mt-xs text-[13px] text-brand-heading">
            {value}
          </Typography>
        )}
      </View>
    </View>
  );
});

export const LoadingFinalWeightCard = memo(function LoadingFinalWeightCard({
  proof,
  className,
}: LoadingFinalWeightCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="flex-row items-center justify-between">
        <Typography
          variant="fieldLabel"
          className="text-[10px] tracking-[0.8px] text-brand-primary"
        >
          {LOADING_WORKFLOW_COPY.completed.finalWeightHeading}
        </Typography>
        <View className="flex-row items-center gap-xs rounded-full bg-brand-success-light px-sm py-xs">
          <CheckCircleIcon size={iconSizes.sm} color={brandColors.success} />
          <Typography variant="badge" className="text-[10px] text-brand-success">
            VERIFIED
          </Typography>
        </View>
      </View>

      <Typography variant="headingLeft" className="mt-md text-[28px] text-brand-heading">
        {formatFinalWeight(proof.finalWeightMt)}
      </Typography>

      <View className="my-md h-px bg-brand-border" />

      <DetailRow
        icon={<TruckIcon size={iconSizes.sm} color={brandColors.muted} />}
        label="Truck Number"
        value={proof.truckNumber}
      />
      <DetailRow
        icon={<CheckCircleIcon size={iconSizes.sm} color={brandColors.primary} />}
        label="Digital Seal ID"
        value={proof.digitalSealId}
        highlight
      />
      <DetailRow
        icon={<LocationPinIcon size={iconSizes.sm} color={brandColors.muted} />}
        label="Warehouse"
        value={proof.warehouse}
      />
    </View>
  );
});

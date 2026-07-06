import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { PURCHASE_ORDER_COPY } from '@/constants/purchaseOrderTimeline';
import { StoreIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type TransactionScopeCardProps = {
  material: string;
  netWeight: string;
  originHub: string;
  dispatchReadiness: string;
  transitWindow: string;
  className?: string;
};

type ScopeFieldProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

const ScopeField = memo(function ScopeField({ label, value, icon }: ScopeFieldProps) {
  return (
    <View className="mb-lg">
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
        {label}
      </Typography>
      <View className="mt-xs flex-row items-center">
        {icon}
        <Typography
          variant="roleTitle"
          className={cn('text-[14px] text-brand-heading', icon ? 'ml-sm' : undefined)}
        >
          {value}
        </Typography>
      </View>
    </View>
  );
});

export const TransactionScopeCard = memo(function TransactionScopeCard({
  material,
  netWeight,
  originHub,
  dispatchReadiness,
  transitWindow,
  className,
}: TransactionScopeCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <Typography variant="roleTitle" className="mb-lg text-[16px] text-brand-heading">
        {PURCHASE_ORDER_COPY.transactionScopeHeading}
      </Typography>

      <ScopeField label={PURCHASE_ORDER_COPY.materialLabel} value={material} />
      <ScopeField label={PURCHASE_ORDER_COPY.netWeightLabel} value={netWeight} />
      <ScopeField
        label={PURCHASE_ORDER_COPY.originFacilityLabel}
        value={originHub}
        icon={<StoreIcon size={iconSizes.md} color={brandColors.primary} />}
      />

      <View className="mt-xs flex-row" style={{ gap: 16 }}>
        <View className="min-w-[45%] flex-1">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-muted"
          >
            {PURCHASE_ORDER_COPY.dispatchReadinessLabel}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {dispatchReadiness}
          </Typography>
        </View>
        <View className="min-w-[45%] flex-1">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-muted"
          >
            {PURCHASE_ORDER_COPY.transitWindowLabel}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {transitWindow}
          </Typography>
        </View>
      </View>
    </View>
  );
});

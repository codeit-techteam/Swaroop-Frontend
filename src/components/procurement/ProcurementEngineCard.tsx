import { memo } from 'react';

import { View } from 'react-native';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Typography } from '@/components/ui/typography';
import { PROCUREMENT_SCREEN_COPY } from '@/constants/procurementSteps';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { EngineCheck, EngineCheckStatus } from '@/types/procurement';
import { cn } from '@/utils/cn';

type ProcurementEngineCardProps = {
  checks: EngineCheck[];
  className?: string;
};

const STATUS_LABELS: Record<EngineCheckStatus, string> = {
  done: 'DONE',
  checking: 'CHECKING',
  pending: 'PENDING',
};

const StatusIndicator = memo(function StatusIndicator({ status }: { status: EngineCheckStatus }) {
  if (status === 'done') {
    return <CheckCircleIcon size={iconSizes.md} color={brandColors.success} />;
  }

  if (status === 'checking') {
    return <LoadingSpinner size={20} strokeWidth={2} color={brandColors.primary} />;
  }

  return <View className="h-5 w-5 rounded-full border-2 border-brand-indicator bg-brand-white" />;
});

const StatusLabel = memo(function StatusLabel({ status }: { status: EngineCheckStatus }) {
  const labelClass =
    status === 'done'
      ? 'text-brand-success'
      : status === 'checking'
        ? 'text-brand-primary'
        : 'text-brand-muted';

  return (
    <Typography variant="roleTitle" className={cn('text-[11px] tracking-[0.4px]', labelClass)}>
      {STATUS_LABELS[status]}
    </Typography>
  );
});

export const ProcurementEngineCard = memo(function ProcurementEngineCard({
  checks,
  className,
}: ProcurementEngineCardProps) {
  return (
    <View
      className={cn(
        'w-full rounded-2xl border border-brand-primary/15 bg-brand-primary-tint px-lg py-lg',
        className,
      )}
    >
      <Typography
        variant="fieldLabel"
        className="mb-md text-[10px] tracking-[0.8px] text-brand-muted"
      >
        {PROCUREMENT_SCREEN_COPY.engineChecksHeading.toUpperCase()}
      </Typography>

      {checks.map((check) => (
        <View key={check.id} className="mb-sm flex-row items-center justify-between last:mb-0">
          <View className="min-w-0 flex-1 flex-row items-center pr-md">
            <StatusIndicator status={check.status} />
            <Typography
              variant="roleDescription"
              className={cn(
                'ml-sm flex-1 text-[13px]',
                check.status === 'pending' ? 'text-brand-muted' : 'text-brand-heading',
              )}
            >
              {check.label}
            </Typography>
          </View>
          <StatusLabel status={check.status} />
        </View>
      ))}
    </View>
  );
});

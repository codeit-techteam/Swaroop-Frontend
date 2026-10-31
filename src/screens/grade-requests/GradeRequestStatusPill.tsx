import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import type { GradeRequestStatus } from '@/types/grade-request';
import { cn } from '@/utils/cn';

const TONE: Record<GradeRequestStatus, { box: string; text: string }> = {
  SUBMITTED: { box: 'bg-brand-background', text: 'text-brand-body' },
  UNDER_REVIEW: { box: 'bg-brand-primary-tint', text: 'text-brand-primary' },
  INFO_REQUIRED: { box: 'bg-brand-error-light', text: 'text-brand-error' },
  GRADE_IDENTIFIED: { box: 'bg-brand-primary-tint', text: 'text-brand-primary' },
  QUOTATION_AVAILABLE: { box: 'bg-brand-success-light', text: 'text-brand-success' },
  CONVERTED_TO_PR: { box: 'bg-brand-success-light', text: 'text-brand-success' },
  REJECTED: { box: 'bg-brand-error-light', text: 'text-brand-error' },
  CLOSED: { box: 'bg-brand-background', text: 'text-brand-muted' },
};

export const GradeRequestStatusPill = memo(function GradeRequestStatusPill({
  status,
  label,
}: {
  status: GradeRequestStatus;
  label: string;
}) {
  const tone = TONE[status] ?? TONE.SUBMITTED;
  return (
    <View className={cn('max-w-[140px] rounded-full px-md py-xs', tone.box)}>
      <Typography variant="roleDescription" className={cn('font-semibold text-[11px]', tone.text)}>
        {label}
      </Typography>
    </View>
  );
});

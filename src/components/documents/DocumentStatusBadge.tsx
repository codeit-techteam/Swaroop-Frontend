import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DOCUMENT_STATUS_LABELS } from '@/constants/documents';
import type { DocumentStatus } from '@/types/documents';
import { cn } from '@/utils/cn';

const STATUS_CLASS: Record<DocumentStatus, { wrap: string; text: string }> = {
  generated: { wrap: 'border-sky-200 bg-sky-50', text: 'text-sky-800' },
  downloaded: { wrap: 'border-indigo-200 bg-indigo-50', text: 'text-indigo-800' },
  pending: { wrap: 'border-amber-200 bg-amber-50', text: 'text-amber-800' },
  approved: { wrap: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-800' },
  verified: { wrap: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-800' },
  cancelled: { wrap: 'border-brand-border bg-brand-surface', text: 'text-brand-muted' },
};

type DocumentStatusBadgeProps = {
  status: DocumentStatus;
  className?: string;
};

export const DocumentStatusBadge = memo(function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  const tone = STATUS_CLASS[status];

  return (
    <View className={cn('rounded-lg border px-sm py-xs', tone.wrap, className)}>
      <Typography variant="badge" className={cn('text-[10px] tracking-normal', tone.text)}>
        {DOCUMENT_STATUS_LABELS[status]}
      </Typography>
    </View>
  );
});

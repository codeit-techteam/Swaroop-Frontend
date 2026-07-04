import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { StatusBadge } from '@/components/ui/status-badge';
import { Typography } from '@/components/ui/typography';
import type { DocumentItem } from '@/types/document';
import { cn } from '@/utils/cn';

type DocumentSummaryCardProps = {
  documents: DocumentItem[];
  onEdit?: () => void;
  className?: string;
};

const statusLabel = (status: DocumentItem['status']): string => {
  switch (status) {
    case 'verified':
      return 'VERIFIED';
    case 'uploaded':
      return 'UPLOADED';
    case 'uploading':
      return 'UPLOADING';
    case 'rejected':
      return 'REJECTED';
    case 'error':
      return 'ERROR';
    default:
      return 'PENDING';
  }
};

const statusVariant = (status: DocumentItem['status']): 'success' | 'primary' | 'muted' => {
  if (status === 'verified') {
    return 'success';
  }
  if (status === 'uploaded' || status === 'uploading') {
    return 'primary';
  }
  return 'muted';
};

export const DocumentSummaryCard = memo(function DocumentSummaryCard({
  documents,
  onEdit,
  className,
}: DocumentSummaryCardProps) {
  return (
    <View
      className={cn(
        'w-full rounded-lg border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
    >
      <View className="mb-lg flex-row items-center justify-between">
        <Typography variant="fieldLabel">Uploaded Documents</Typography>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button">
            <Typography variant="link">Edit</Typography>
          </Pressable>
        ) : null}
      </View>

      <View className="gap-md">
        {documents.map((document) => (
          <View
            key={document.id}
            className="flex-row items-center justify-between border-b border-brand-border pb-md"
          >
            <View className="mr-md flex-1">
              <Typography variant="roleTitle" className="text-[14px]">
                {document.title}
              </Typography>
              <Typography variant="legal" className="mt-xs text-left" numberOfLines={1}>
                {document.file?.name ?? (document.required ? 'Not uploaded' : 'Optional — skipped')}
              </Typography>
            </View>
            <StatusBadge
              label={statusLabel(document.status)}
              variant={statusVariant(document.status)}
            />
          </View>
        ))}
      </View>
    </View>
  );
});

import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { DocumentFileIcon, DownloadIcon } from '@/icons';
import { DOCUMENT_STATUS_LABELS } from '@/seller/mock/documents';
import type { DocumentStatus, SellerDocumentItem } from '@/seller/types/documents';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const STATUS_STYLES: Record<DocumentStatus, { bg: string; text: string }> = {
  verified: { bg: 'bg-green-50', text: 'text-brand-success' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  rejected: { bg: 'bg-red-50', text: 'text-brand-error' },
  expired: { bg: 'bg-brand-surface', text: 'text-brand-body' },
};

type DocumentCardProps = {
  document: SellerDocumentItem;
  onPreview: () => void;
  onDownload: () => void;
};

export const SellerDocumentCard = memo(function SellerDocumentCard({
  document,
  onPreview,
  onDownload,
}: DocumentCardProps) {
  const statusStyle = STATUS_STYLES[document.status];

  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-start">
        <View className="mr-md h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-light">
          <DocumentFileIcon size={20} color={brandColors.primaryDark} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-sm">
            <View className="flex-1">
              <Typography variant="roleTitle" numberOfLines={1}>
                {document.name}
              </Typography>
              <Typography variant="legal" className="mt-0.5 text-left text-brand-body">
                {document.section}
              </Typography>
            </View>
            <View className={cn('rounded-full px-sm py-xs', statusStyle.bg)}>
              <Typography variant="badge" className={cn('text-[10px]', statusStyle.text)}>
                {DOCUMENT_STATUS_LABELS[document.status]}
              </Typography>
            </View>
          </View>

          <View className="mt-sm flex-row items-center gap-md">
            <Typography variant="legal" className="text-brand-body">
              {document.uploadDate}
            </Typography>
            <Typography variant="legal" className="text-brand-body">
              {document.fileSize}
            </Typography>
          </View>

          <View className="mt-md flex-row gap-sm">
            <Pressable
              onPress={onPreview}
              className="flex-1 items-center rounded-xl bg-brand-primary px-md py-sm"
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <Typography variant="button" className="text-[12px] text-brand-white">
                Preview
              </Typography>
            </Pressable>
            <Pressable
              onPress={onDownload}
              className="h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-white"
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <DownloadIcon size={18} color={brandColors.primaryDark} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

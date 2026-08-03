import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { DocumentFileIcon, DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import type { DispatchDocument } from '@/seller/modules/dispatch/types/dispatch';

export const DispatchDocumentCard = memo(function DispatchDocumentCard({
  document,
  onDownload,
}: {
  document: DispatchDocument;
  onDownload: (document: DispatchDocument) => void;
}) {
  const ready = document.status === 'ready';
  return (
    <View className="flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <View className="mr-md h-11 w-11 items-center justify-center rounded-xl bg-brand-surface">
        <DocumentFileIcon size={20} color={ready ? brandColors.invoice : brandColors.body} />
      </View>
      <View className="flex-1 pr-sm">
        <Typography variant="roleTitle">{document.name}</Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          {document.size} • {document.uploadedAt}
        </Typography>
      </View>
      <Pressable
        onPress={() => onDownload(document)}
        disabled={!ready}
        className={cn(
          'h-10 w-10 items-center justify-center rounded-full',
          ready ? 'bg-brand-surface' : 'bg-brand-border/50',
        )}
      >
        <DownloadIcon size={16} color={ready ? brandColors.heading : brandColors.footer} />
      </Pressable>
    </View>
  );
});

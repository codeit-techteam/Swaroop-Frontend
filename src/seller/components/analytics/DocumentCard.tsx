import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

export const DocumentCard = memo(function DocumentCard({
  title,
  fileName,
  onDownload,
}: {
  title: string;
  fileName: string;
  onDownload?: () => void;
}) {
  return (
    <Pressable
      onPress={onDownload}
      className="mb-sm flex-row items-center justify-between rounded-xl border border-brand-border bg-brand-surface px-md py-md"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="flex-1 pr-sm">
        <Typography variant="roleTitle">{title}</Typography>
        <Typography variant="legal" className="mt-0.5 text-left text-brand-body">
          {fileName}
        </Typography>
      </View>
      <View className="flex-row items-center gap-xs">
        <Typography variant="link" className="text-[12px]">
          Download
        </Typography>
        <DownloadIcon size={16} color={brandColors.primary} />
      </View>
    </Pressable>
  );
});

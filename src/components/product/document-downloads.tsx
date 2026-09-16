import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import Toast from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { DocumentFileIcon, DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ComplianceDocument } from '@/types/product';
import { cn } from '@/utils/cn';

type DocumentDownloadsProps = {
  documents: ComplianceDocument[];
  className?: string;
};

export const DocumentDownloads = memo(function DocumentDownloads({
  documents,
  className,
}: DocumentDownloadsProps) {
  const handleDownload = useCallback((doc: ComplianceDocument) => {
    Toast.show({
      type: 'success',
      text1: `${doc.title} download started`,
      text2: `${doc.fileName} — document preview.`,
      visibilityTime: 2200,
    });
  }, []);

  if (documents.length === 0) {
    return null;
  }

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
        Downloads
      </Typography>
      <Typography
        variant="caption"
        className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
      >
        Product documents and certificates
      </Typography>
      <View className="mt-md" style={{ gap: 8 }}>
        {documents.map((doc) => (
          <Pressable
            key={doc.id}
            onPress={() => handleDownload(doc)}
            accessibilityRole="button"
            accessibilityLabel={`Download ${doc.title}`}
            className="flex-row items-center rounded-lg border border-brand-border bg-brand-surface px-md py-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-white">
              <DocumentFileIcon size={iconSizes.md} color={brandColors.primary} />
            </View>
            <View className="ml-sm min-w-0 flex-1">
              <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                {doc.title}
              </Typography>
              <Typography
                variant="caption"
                className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                numberOfLines={1}
              >
                {doc.description}
              </Typography>
            </View>
            <DownloadIcon size={16} color={brandColors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
});

import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';

import { StatusBadge } from '@/components/ui/status-badge';
import { Typography } from '@/components/ui/typography';
import { UploadProgress } from '@/components/ui/upload-progress';
import { BriefcaseIcon, DocumentFileIcon, IdCardIcon, PaperclipIcon, UploadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { DocumentId, DocumentItem } from '@/types/document';
import { cn } from '@/utils/cn';

type DocumentUploadCardProps = {
  document: DocumentItem;
  onUpload: (id: DocumentId) => void;
  className?: string;
};

const iconForDocument = (id: DocumentId, status: DocumentItem['status']): ReactNode => {
  if (id === 'pan') {
    return (
      <BriefcaseIcon color={status === 'verified' ? brandColors.success : brandColors.primary} />
    );
  }
  if (id === 'gst') {
    return (
      <DocumentFileIcon color={status === 'uploading' ? brandColors.primary : brandColors.muted} />
    );
  }
  return <IdCardIcon color={brandColors.muted} />;
};

export const DocumentUploadCard = memo(function DocumentUploadCard({
  document,
  onUpload,
  className,
}: DocumentUploadCardProps) {
  const { id, title, description, status, progress, file, errorMessage } = document;
  const isVerified = status === 'verified';
  const isUploading = status === 'uploading';
  const isIdle = status === 'idle' || status === 'error';

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      className={cn(
        'w-full rounded-lg border bg-brand-white px-lg py-lg',
        isVerified && 'border-brand-success',
        isUploading && 'border-brand-primary',
        isIdle && 'border-dashed border-brand-border',
        className,
      )}
    >
      <View className="flex-row items-start">
        <View
          className={cn(
            'mr-md h-11 w-11 items-center justify-center rounded-md',
            isVerified && 'bg-brand-success-light',
            isUploading && 'bg-brand-primary-light',
            isIdle && 'bg-brand-surface',
          )}
        >
          {iconForDocument(id, status)}
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="mr-sm flex-1">
              <Typography variant="roleTitle">{title}</Typography>
              <Typography variant="roleDescription" className="mt-xs">
                {description}
              </Typography>
            </View>

            {isVerified ? <StatusBadge label="✔ VERIFIED" variant="success" /> : null}
            {isUploading ? (
              <Typography variant="badge" className="text-brand-primary">
                {progress}%
              </Typography>
            ) : null}
            {isIdle ? (
              <Pressable
                onPress={() => onUpload(id)}
                accessibilityRole="button"
                accessibilityLabel={`Upload ${title}`}
                className="flex-row items-center gap-xs rounded-md bg-brand-primary px-md py-sm"
              >
                <UploadIcon />
                <Typography variant="button" className="text-[12px]">
                  UPLOAD
                </Typography>
              </Pressable>
            ) : null}
          </View>

          {isVerified && file ? (
            <View className="mt-md flex-row items-center gap-xs">
              <PaperclipIcon />
              <Typography variant="success" className="flex-1" numberOfLines={1}>
                {file.name}
              </Typography>
            </View>
          ) : null}

          {isUploading ? <UploadProgress progress={progress} className="mt-md" /> : null}

          {errorMessage ? (
            <Typography variant="error" className="mt-sm">
              {errorMessage}
            </Typography>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
});

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

const iconColorForStatus = (status: DocumentItem['status']): string => {
  if (status === 'uploading') {
    return brandColors.primary;
  }
  if (status === 'uploaded' || status === 'verified') {
    return brandColors.uploadedText;
  }
  return brandColors.muted;
};

const iconForDocument = (id: DocumentId, status: DocumentItem['status']): ReactNode => {
  const color = iconColorForStatus(status);

  if (id === 'pan') {
    return <BriefcaseIcon color={color} />;
  }
  if (id === 'aadhaar') {
    return <IdCardIcon color={color} />;
  }
  return <DocumentFileIcon color={color} />;
};

export const DocumentUploadCard = memo(function DocumentUploadCard({
  document,
  onUpload,
  className,
}: DocumentUploadCardProps) {
  const { id, title, description, status, progress, file, errorMessage, required } = document;
  // Frontend always shows UPLOADED until admin verification exists on the backend.
  const isUploadedState = status === 'uploaded' || status === 'verified';
  const isUploading = status === 'uploading';
  const isRejected = status === 'rejected';
  const isIdle = status === 'idle' || status === 'error';
  const canReplace = isUploadedState || isRejected;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      className={cn(
        'w-full rounded-lg border bg-brand-white px-lg py-lg',
        isUploadedState && 'border-brand-uploaded-text',
        isUploading && 'border-brand-primary',
        isRejected && 'border-brand-error',
        isIdle && 'border-dashed border-brand-border',
        className,
      )}
    >
      <View className="flex-row items-start">
        <View
          className={cn(
            'mr-md h-11 w-11 items-center justify-center rounded-md',
            isUploadedState && 'bg-brand-uploaded',
            isUploading && 'bg-brand-primary-light',
            isRejected && 'bg-brand-surface',
            isIdle && 'bg-brand-surface',
          )}
        >
          {iconForDocument(id, status)}
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between">
            <View className="mr-sm flex-1">
              <View className="flex-row items-center gap-xs">
                <Typography variant="roleTitle">{title}</Typography>
                {!required ? (
                  <Typography variant="legal" className="text-brand-muted">
                    Optional
                  </Typography>
                ) : null}
              </View>
              <Typography variant="roleDescription" className="mt-xs">
                {description}
              </Typography>
            </View>

            {isUploadedState ? <StatusBadge label="UPLOADED" variant="uploaded" /> : null}
            {isRejected ? <StatusBadge label="REJECTED" variant="muted" /> : null}
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

          {isUploadedState && file ? (
            <View className="mt-md flex-row items-center gap-xs">
              <PaperclipIcon />
              <Typography
                variant="success"
                className="flex-1 text-brand-uploaded-text"
                numberOfLines={1}
              >
                {file.name}
              </Typography>
            </View>
          ) : null}

          {isUploading ? <UploadProgress progress={progress} className="mt-md" /> : null}

          {canReplace ? (
            <Pressable onPress={() => onUpload(id)} className="mt-sm self-start" hitSlop={8}>
              <Typography variant="link">Replace File</Typography>
            </Pressable>
          ) : null}

          {isRejected ? (
            <Typography variant="error" className="mt-sm">
              Document rejected. Please upload again.
            </Typography>
          ) : null}

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

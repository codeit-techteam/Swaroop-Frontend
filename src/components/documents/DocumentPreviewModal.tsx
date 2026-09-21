import { memo } from 'react';

import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { DocumentPreviewState } from '@/types/documents';

type DocumentPreviewModalProps = {
  preview: DocumentPreviewState | null;
  onClose: () => void;
  onShare?: () => void;
};

export const DocumentPreviewModal = memo(function DocumentPreviewModal({
  preview,
  onClose,
  onShare,
}: DocumentPreviewModalProps) {
  if (!preview) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close document preview"
      >
        <Pressable
          className="max-h-[82%] w-full rounded-t-[28px] bg-brand-white px-xl pb-2xl pt-lg"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-md h-1.5 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="text-[18px]">
            {preview.title}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-brand-muted">
            {preview.categoryLabel}
            {preview.documentNumber ? ` · ${preview.documentNumber}` : ''}
            {preview.orderNumber ? ` · ${preview.orderNumber}` : ''}
          </Typography>

          <ScrollView className="mt-md" showsVerticalScrollIndicator={false}>
            <View className="rounded-2xl border border-brand-border bg-brand-surface p-md">
              <Typography
                variant="legal"
                className="text-left font-sans text-[12px] leading-[18px] text-brand-heading"
              >
                {preview.content}
              </Typography>
            </View>
          </ScrollView>

          <View className="mt-md flex-row gap-sm">
            {onShare ? (
              <Pressable
                onPress={onShare}
                className="flex-1 items-center rounded-xl bg-brand-primary py-md"
                style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
              >
                <Typography variant="button" className="text-[13px]">
                  Share
                </Typography>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onClose}
              className="flex-1 items-center rounded-xl border border-brand-border py-md"
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <Typography variant="buttonSecondary" className="text-[13px] text-brand-heading">
                Close
              </Typography>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

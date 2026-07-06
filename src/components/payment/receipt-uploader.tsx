import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';

import { Typography } from '@/components/ui/typography';
import { CameraIcon, CloudUploadIcon, DocumentFileIcon, GalleryIcon, TrashIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { PaymentProofReceipt } from '@/types/order';
import { cn } from '@/utils/cn';
import { formatReceiptSize } from '@/utils/payment-proof';

type ReceiptUploaderProps = {
  receipt: PaymentProofReceipt | null;
  error?: string;
  onPickGallery: () => void;
  onPickCamera: () => void;
  onRemove: () => void;
  onReplace: () => void;
  className?: string;
};

const isImageReceipt = (receipt: PaymentProofReceipt): boolean =>
  receipt.mimeType?.startsWith('image/') ?? /\.(jpe?g|png)$/i.test(receipt.name);

export const ReceiptUploader = memo(function ReceiptUploader({
  receipt,
  error,
  onPickGallery,
  onPickCamera,
  onRemove,
  onReplace,
  className,
}: ReceiptUploaderProps) {
  const handleRetake = useCallback(() => {
    onPickCamera();
  }, [onPickCamera]);

  if (receipt) {
    const isImage = isImageReceipt(receipt);

    return (
      <View className={cn('w-full', className)}>
        <Typography variant="fieldLabel" className="mb-sm text-brand-body">
          Upload Receipt
        </Typography>

        <View className="rounded-2xl border border-brand-border bg-brand-white p-lg">
          <View className="flex-row items-center">
            {isImage ? (
              <View className="mr-md h-14 w-14 overflow-hidden rounded-lg bg-brand-surface">
                <Image
                  source={{ uri: receipt.uri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  accessibilityLabel="Payment receipt preview"
                />
              </View>
            ) : (
              <View className="mr-md h-14 w-14 items-center justify-center rounded-lg bg-brand-primary-light">
                <DocumentFileIcon size={iconSizes.lg} color={brandColors.primary} />
              </View>
            )}

            <View className="min-w-0 flex-1">
              <Typography
                variant="roleTitle"
                className="text-[14px] text-brand-heading"
                numberOfLines={1}
              >
                {receipt.name}
              </Typography>
              <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-muted">
                {formatReceiptSize(receipt.size)}
              </Typography>
            </View>

            <Pressable
              onPress={onRemove}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove receipt"
              className="h-9 w-9 items-center justify-center"
            >
              <TrashIcon size={iconSizes.md} color={brandColors.error} />
            </Pressable>
          </View>

          <View className="mt-md flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={onReplace}
              accessibilityRole="button"
              accessibilityLabel="Replace receipt"
              className="h-10 flex-1 items-center justify-center rounded-md border border-brand-border bg-brand-white"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
                Replace
              </Typography>
            </Pressable>
            <Pressable
              onPress={handleRetake}
              accessibilityRole="button"
              accessibilityLabel="Retake receipt photo"
              className="h-10 flex-1 items-center justify-center rounded-md border border-brand-border bg-brand-white"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
                Retake
              </Typography>
            </Pressable>
          </View>
        </View>

        {error ? (
          <Typography variant="error" className="mt-xs">
            {error}
          </Typography>
        ) : null}
      </View>
    );
  }

  return (
    <View className={cn('w-full', className)}>
      <Typography variant="fieldLabel" className="mb-sm text-brand-body">
        Upload Receipt
      </Typography>

      <View className="items-center rounded-2xl border border-dashed border-brand-primary/40 bg-brand-primary-tint px-lg py-xl">
        <View className="mb-md h-14 w-14 items-center justify-center rounded-full bg-brand-primary-light">
          <CloudUploadIcon size={iconSizes.xl} color={brandColors.primary} />
        </View>

        <Typography variant="roleTitle" className="text-center text-[15px] text-brand-heading">
          Tap to upload payment proof
        </Typography>
        <Typography
          variant="roleDescription"
          className="mt-xs text-center text-[12px] text-brand-muted"
        >
          JPG, PNG, PDF | Max 10MB
        </Typography>

        <View className="mt-lg w-full flex-row" style={{ gap: 12 }}>
          <Pressable
            onPress={onPickGallery}
            accessibilityRole="button"
            accessibilityLabel="Pick from gallery"
            className="h-11 flex-1 flex-row items-center justify-center rounded-md border border-brand-border bg-brand-white"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <GalleryIcon />
            <Typography variant="roleTitle" className="ml-sm text-[13px] text-brand-heading">
              Gallery
            </Typography>
          </Pressable>

          <Pressable
            onPress={onPickCamera}
            accessibilityRole="button"
            accessibilityLabel="Take photo with camera"
            className="h-11 flex-1 flex-row items-center justify-center rounded-md border border-brand-border bg-brand-white"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <CameraIcon />
            <Typography variant="roleTitle" className="ml-sm text-[13px] text-brand-heading">
              Camera
            </Typography>
          </Pressable>
        </View>
      </View>

      {error ? (
        <Typography variant="error" className="mt-xs">
          {error}
        </Typography>
      ) : null}
    </View>
  );
});

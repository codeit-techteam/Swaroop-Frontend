import { memo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { DocumentFileIcon, PaperclipIcon, UploadIcon } from '@/icons';
import type { SellerDocument } from '@/seller/types';
import { cn } from '@/utils/cn';

type SellerCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export const SellerCard = memo(function SellerCard({
  title,
  children,
  className,
  actionLabel,
  onActionPress,
}: SellerCardProps) {
  return (
    <View className={cn('rounded-2xl bg-brand-white p-lg shadow-sm', className)}>
      {title ? (
        <View className="mb-md flex-row items-center justify-between">
          <Typography variant="roleTitle">{title}</Typography>
          {actionLabel ? (
            <Pressable onPress={onActionPress} hitSlop={8}>
              <Typography variant="link">{actionLabel}</Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
});

type SellerUploadCardProps = {
  document: SellerDocument;
  onUpload: () => void;
};

export const SellerUploadCard = memo(function SellerUploadCard({
  document,
  onUpload,
}: SellerUploadCardProps) {
  const uploaded = document.status === 'uploaded';
  const uploading = document.status === 'uploading';

  return (
    <SellerCard className={cn(uploaded && 'border border-brand-primary')}>
      <View className="flex-row items-start">
        <View
          className={cn(
            'mr-md h-11 w-11 items-center justify-center rounded-xl',
            uploaded ? 'bg-brand-primary-light' : 'bg-brand-surface',
          )}
        >
          <DocumentFileIcon />
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-sm">
            <View className="flex-1">
              <Typography variant="roleTitle">{document.title}</Typography>
              <Typography variant="roleDescription" className="mt-xs">
                {document.subtitle}
              </Typography>
            </View>
            {uploaded ? (
              <View className="rounded-full bg-brand-uploaded px-sm py-xs">
                <Typography variant="badge" className="text-brand-uploaded-text">
                  Uploaded
                </Typography>
              </View>
            ) : null}
          </View>

          {document.file ? (
            <View className="mt-md flex-row items-center gap-xs">
              <PaperclipIcon />
              <Typography variant="success" className="flex-1 text-brand-heading" numberOfLines={1}>
                {document.file.name}
              </Typography>
            </View>
          ) : null}

          {uploading ? (
            <View className="mt-md h-2 overflow-hidden rounded-full bg-brand-border">
              <View
                className="h-full rounded-full bg-brand-primary"
                style={{ width: `${document.progress}%` }}
              />
            </View>
          ) : (
            <Pressable
              onPress={onUpload}
              className="mt-md flex-row items-center self-start rounded-xl bg-brand-navy px-md py-sm"
            >
              <UploadIcon />
              <Typography variant="button" className="ml-xs text-[12px]">
                {uploaded ? 'Replace File' : 'Upload'}
              </Typography>
            </Pressable>
          )}

          {document.errorMessage ? (
            <Typography variant="error" className="mt-sm text-left">
              {document.errorMessage}
            </Typography>
          ) : null}
        </View>
      </View>
    </SellerCard>
  );
});

type SellerEmptyStateProps = {
  title: string;
  description: string;
};

export const SellerEmptyState = memo(function SellerEmptyState({
  title,
  description,
}: SellerEmptyStateProps) {
  return (
    <SellerCard className="items-center">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-primary-light">
        <DocumentFileIcon />
      </View>
      <Typography variant="roleTitle" className="mt-md text-center">
        {title}
      </Typography>
      <Typography variant="subheading" className="mt-sm">
        {description}
      </Typography>
    </SellerCard>
  );
});

type SellerSuccessBannerProps = {
  title: string;
  description: string;
  className?: string;
};

export const SellerSuccessBanner = memo(function SellerSuccessBanner({
  title,
  description,
  className,
}: SellerSuccessBannerProps) {
  return (
    <View className={cn('rounded-2xl bg-brand-primary-light px-lg py-md', className)}>
      <Typography variant="roleTitle" className="text-brand-primary">
        {title}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs">
        {description}
      </Typography>
    </View>
  );
});

import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { DocumentStatusBadge } from '@/components/documents/DocumentStatusBadge';
import { Typography } from '@/components/ui/typography';
import { CopyIcon, DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { DocumentStatus } from '@/types/documents';
import { cn } from '@/utils/cn';

type DocumentListCardProps = {
  title: string;
  subtitle: string;
  meta: string;
  amount?: string;
  status: DocumentStatus;
  extraBadge?: string;
  extraBadgeTone?: 'emerald' | 'amber' | 'sky' | 'slate';
  onView: () => void;
  onDownload: () => void;
  onShare?: () => void;
  onDuplicate?: () => void;
  onConvert?: () => void;
  convertDisabled?: boolean;
};

const EXTRA_TONE = {
  emerald: { wrap: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-800' },
  amber: { wrap: 'border-amber-200 bg-amber-50', text: 'text-amber-800' },
  sky: { wrap: 'border-sky-200 bg-sky-50', text: 'text-sky-800' },
  slate: { wrap: 'border-brand-border bg-brand-surface', text: 'text-brand-muted' },
} as const;

export const DocumentListCard = memo(function DocumentListCard({
  title,
  subtitle,
  meta,
  amount,
  status,
  extraBadge,
  extraBadgeTone = 'sky',
  onView,
  onDownload,
  onShare,
  onDuplicate,
  onConvert,
  convertDisabled,
}: DocumentListCardProps) {
  const extra = EXTRA_TONE[extraBadgeTone];

  return (
    <Pressable
      onPress={onView}
      accessibilityRole="button"
      accessibilityLabel={`View ${title}`}
      className="rounded-2xl border border-brand-border bg-brand-white p-lg"
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography
            variant="roleTitle"
            className="text-[15px] text-brand-primary"
            numberOfLines={1}
          >
            {title}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs text-brand-body" numberOfLines={2}>
            {subtitle}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-brand-muted">
            {meta}
          </Typography>
        </View>
        <View className="items-end gap-xs">
          {amount ? (
            <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
              {amount}
            </Typography>
          ) : null}
          <DocumentStatusBadge status={status} />
          {extraBadge ? (
            <View className={cn('rounded-lg border px-sm py-xs', extra.wrap)}>
              <Typography variant="badge" className={cn('text-[10px] tracking-normal', extra.text)}>
                {extraBadge}
              </Typography>
            </View>
          ) : null}
        </View>
      </View>

      <View className="mt-md flex-row gap-sm">
        <ActionChip label="View" onPress={onView} />
        <Pressable
          onPress={onDownload}
          accessibilityRole="button"
          accessibilityLabel="Download"
          className="h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-white"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <DownloadIcon size={16} color={brandColors.primaryDark} />
        </Pressable>
        {onShare ? <ActionChip label="Share" onPress={onShare} /> : null}
        {onDuplicate ? (
          <Pressable
            onPress={onDuplicate}
            accessibilityRole="button"
            accessibilityLabel="Duplicate"
            className="h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-white"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <CopyIcon size={16} color={brandColors.primaryDark} />
          </Pressable>
        ) : null}
        {onConvert ? (
          <ActionChip label="Convert" onPress={onConvert} disabled={convertDisabled} />
        ) : null}
      </View>
    </Pressable>
  );
});

const ActionChip = memo(function ActionChip({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={cn(
        'h-9 items-center justify-center rounded-xl px-md',
        disabled ? 'bg-brand-surface' : 'bg-brand-primary-tint',
      )}
      style={({ pressed }) => ({ opacity: disabled ? 0.55 : pressed ? 0.85 : 1 })}
    >
      <Typography
        variant="badge"
        className={cn(
          'text-[11px] tracking-normal',
          disabled ? 'text-brand-muted' : 'text-brand-primary',
        )}
      >
        {label}
      </Typography>
    </Pressable>
  );
});

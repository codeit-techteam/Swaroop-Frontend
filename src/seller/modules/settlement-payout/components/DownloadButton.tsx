import { memo } from 'react';

import { Pressable } from 'react-native';

import { Typography } from '@/components';
import { DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

export const DownloadButton = memo(function DownloadButton({
  label,
  onPress,
  compact = false,
  className,
}: {
  label: string;
  onPress: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center justify-center gap-xs rounded-xl border border-brand-border bg-brand-white',
        compact ? 'px-md py-sm' : 'px-lg py-md',
        className,
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <DownloadIcon size={compact ? 14 : 16} color={brandColors.primaryDark} />
      <Typography variant={compact ? 'legal' : 'roleTitle'} className="text-brand-primary">
        {label}
      </Typography>
    </Pressable>
  );
});

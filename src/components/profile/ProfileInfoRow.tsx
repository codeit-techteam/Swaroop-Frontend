import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ChevronRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type ProfileInfoRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
};

export const ProfileInfoRow = memo(function ProfileInfoRow({
  label,
  value,
  onPress,
  showChevron = false,
  className,
}: ProfileInfoRowProps) {
  const content = (
    <View className={cn('flex-1', className)}>
      <Typography variant="fieldLabel" className="text-brand-label">
        {label}
      </Typography>
      <Typography variant="roleTitle" className="mt-xs text-[15px] text-brand-heading">
        {value || '—'}
      </Typography>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {content}
      {showChevron ? <ChevronRightIcon color={brandColors.muted} /> : null}
    </Pressable>
  );
});

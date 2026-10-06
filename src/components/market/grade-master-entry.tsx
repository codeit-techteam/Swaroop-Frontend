import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ChevronRightIcon, SearchIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type GradeMasterEntryProps = {
  onPress: () => void;
  /** Total customer-visible grades, when known. */
  gradeCount?: number;
  query?: string;
  className?: string;
};

export const GradeMasterEntry = memo(function GradeMasterEntry({
  onPress,
  gradeCount,
  query,
  className,
}: GradeMasterEntryProps) {
  const trimmed = query?.trim();
  const title = trimmed ? `Search all grades for “${trimmed}”` : 'Browse all grades';
  const subtitle =
    gradeCount && gradeCount > 0
      ? `${gradeCount.toLocaleString('en-IN')} grades by category, grade group and manufacturer`
      : 'Explore the full grade catalogue by category, grade group and manufacturer';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className={cn(
        'mx-lg mb-md flex-row items-center rounded-xl border border-brand-border bg-brand-primary-tint px-md py-md',
        className,
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-white">
        <SearchIcon size={iconSizes.sm} color={brandColors.primary} />
      </View>
      <View className="ml-md flex-1">
        <Typography
          variant="roleTitle"
          className="text-[14px] text-brand-heading"
          numberOfLines={1}
        >
          {title}
        </Typography>
        <Typography variant="roleDescription" className="mt-0.5 text-[12px] text-brand-muted">
          {subtitle}
        </Typography>
      </View>
      <ChevronRightIcon size={iconSizes.sm} color={brandColors.primary} />
    </Pressable>
  );
});

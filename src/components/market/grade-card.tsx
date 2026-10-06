import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ChevronRightIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { CustomerGrade } from '@/types/grade-master';
import { cn } from '@/utils/cn';

export const gradeIdentityLine = (grade: CustomerGrade): string =>
  [grade.gradeNo, grade.manufacturer].filter(Boolean).join(' · ') || grade.code;

export const liveOfferLabel = (count: number): string =>
  count === 1 ? '1 live offer' : `${count} live offers`;

type GradeCardProps = {
  grade: CustomerGrade;
  onPress: (grade: CustomerGrade) => void;
  className?: string;
};

export const GradeCard = memo(function GradeCard({ grade, onPress, className }: GradeCardProps) {
  const handlePress = useCallback(() => onPress(grade), [grade, onPress]);
  const offers = grade.liveOfferCount;

  return (
    <View className={cn('mx-lg mb-md', className)}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`View grade ${grade.displayName}`}
        className="flex-row items-center rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm"
        style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1 })}
      >
        <View className="flex-1 pr-md">
          <View className="flex-row flex-wrap items-center gap-xs">
            {grade.category ? (
              <View className="rounded-md bg-brand-primary-light px-sm py-xs">
                <Typography variant="badge" className="text-[10px] tracking-[0.6px]">
                  {grade.category.displayName}
                </Typography>
              </View>
            ) : null}
            {grade.gradeGroup ? (
              <View className="rounded-md bg-brand-overlay px-sm py-xs">
                <Typography
                  variant="badge"
                  className="text-[10px] tracking-[0.6px] text-brand-body"
                >
                  {grade.gradeGroup}
                </Typography>
              </View>
            ) : null}
          </View>
          <Typography
            variant="roleTitle"
            className="mt-sm text-[15px] leading-[20px] text-brand-heading"
            numberOfLines={2}
          >
            {grade.displayName}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-muted">
            {gradeIdentityLine(grade)}
          </Typography>
          {offers !== undefined ? (
            <Typography
              variant="success"
              className={cn('mt-sm text-[12px]', offers > 0 ? '' : 'text-brand-muted')}
            >
              {offers > 0 ? liveOfferLabel(offers) : 'No live offers'}
            </Typography>
          ) : null}
        </View>
        <ChevronRightIcon size={iconSizes.md} color={brandColors.muted} />
      </Pressable>
    </View>
  );
});

import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
};

export const SectionTitle = memo(function SectionTitle({
  title,
  subtitle,
  align = 'center',
  className,
}: SectionTitleProps) {
  return (
    <View className={cn('w-full', align === 'center' && 'items-center', className)}>
      <Typography variant={align === 'center' ? 'sectionTitle' : 'headingLeft'}>{title}</Typography>
      {subtitle ? (
        <Typography
          variant={align === 'center' ? 'subheading' : 'subheadingLeft'}
          className="mt-sm"
        >
          {subtitle}
        </Typography>
      ) : null}
    </View>
  );
});

import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type ProfileSectionHeaderProps = {
  title: string;
  icon?: ReactNode;
  className?: string;
};

export const ProfileSectionHeader = memo(function ProfileSectionHeader({
  title,
  icon,
  className,
}: ProfileSectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center gap-sm', className)}>
      {icon}
      <Typography variant="roleTitle" className="text-[16px] text-brand-primary">
        {title}
      </Typography>
    </View>
  );
});

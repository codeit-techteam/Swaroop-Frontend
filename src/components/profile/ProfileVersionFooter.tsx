import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { PROFILE_APP_NAME, PROFILE_APP_VERSION, PROFILE_COPYRIGHT } from '@/constants/profile';
import { cn } from '@/utils/cn';

type ProfileVersionFooterProps = {
  className?: string;
};

export const ProfileVersionFooter = memo(function ProfileVersionFooter({
  className,
}: ProfileVersionFooterProps) {
  return (
    <View className={cn('items-center py-lg', className)}>
      <Typography variant="footer" className="text-brand-muted">
        {`${PROFILE_APP_NAME.toUpperCase()} ${PROFILE_APP_VERSION.toUpperCase()}`}
      </Typography>
      <Typography variant="footer" className="mt-xs text-brand-footer">
        {PROFILE_COPYRIGHT}
      </Typography>
    </View>
  );
});

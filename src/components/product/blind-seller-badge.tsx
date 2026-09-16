import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { LockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type BlindSellerBadgeProps = {
  className?: string;
};

export const BlindSellerBadge = memo(function BlindSellerBadge({
  className,
}: BlindSellerBadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center self-start rounded-md bg-brand-surface px-sm py-xs',
        className,
      )}
      accessibilityLabel="Seller identity protected"
    >
      <LockIcon size={12} color={brandColors.muted} />
      <Typography
        variant="caption"
        className="ml-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
      >
        Seller Identity Protected
      </Typography>
    </View>
  );
});

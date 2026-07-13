import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DISPATCH_STARTED_COPY } from '@/constants/dispatchStarted';
import { CheckCircleIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DispatchSecurityCardProps = {
  className?: string;
};

export const DispatchSecurityCard = memo(function DispatchSecurityCard({
  className,
}: DispatchSecurityCardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
      style={elevation.sm}
    >
      <View className="mb-md flex-row items-center gap-sm">
        <ShieldCheckIcon size={iconSizes.sm} color={brandColors.primary} />
        <Typography
          variant="fieldLabel"
          className="text-[10px] tracking-[0.8px] text-brand-primary"
        >
          {DISPATCH_STARTED_COPY.securityHeading}
        </Typography>
      </View>

      {DISPATCH_STARTED_COPY.securityItems.map((item) => (
        <View key={item} className="flex-row items-center gap-sm py-sm">
          <CheckCircleIcon size={iconSizes.sm} color={brandColors.success} />
          <Typography variant="subheadingLeft" className="text-[13px] text-brand-heading">
            {item}
          </Typography>
        </View>
      ))}
    </View>
  );
});

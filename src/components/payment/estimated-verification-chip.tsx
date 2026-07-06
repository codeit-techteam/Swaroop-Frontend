import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import {
  ESTIMATED_VERIFICATION_TIME,
  VERIFICATION_SCREEN_COPY,
} from '@/constants/verificationStatus';
import { ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type EstimatedVerificationChipProps = {
  duration?: string;
  className?: string;
};

export const EstimatedVerificationChip = memo(function EstimatedVerificationChip({
  duration = ESTIMATED_VERIFICATION_TIME,
  className,
}: EstimatedVerificationChipProps) {
  return (
    <View
      className={cn(
        'flex-row items-center self-center rounded-full bg-brand-primary px-md py-sm',
        className,
      )}
    >
      <ClockIcon size={iconSizes.sm} color={brandColors.white} />
      <Typography variant="roleTitle" className="ml-xs text-[12px] text-brand-white">
        {VERIFICATION_SCREEN_COPY.estimatedTimePrefix} {duration}
      </Typography>
    </View>
  );
});

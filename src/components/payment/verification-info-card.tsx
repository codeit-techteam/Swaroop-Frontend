import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { VERIFICATION_SCREEN_COPY } from '@/constants/verificationStatus';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type VerificationInfoCardProps = {
  message?: string;
  className?: string;
};

export const VerificationInfoCard = memo(function VerificationInfoCard({
  message = VERIFICATION_SCREEN_COPY.infoMessage,
  className,
}: VerificationInfoCardProps) {
  return (
    <View
      className={cn(
        'flex-row items-start rounded-xl border border-brand-primary/20 bg-brand-primary-tint px-md py-md',
        className,
      )}
    >
      <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-primary">
        <InfoIcon size={iconSizes.sm} color={brandColors.white} />
      </View>
      <Typography
        variant="roleDescription"
        className="ml-sm flex-1 text-[13px] leading-5 text-brand-heading"
      >
        {message}
      </Typography>
    </View>
  );
});

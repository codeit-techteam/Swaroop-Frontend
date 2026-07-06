import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { AlertCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { VerificationErrorState } from '@/types/paymentVerification';
import { cn } from '@/utils/cn';

type VerificationErrorCardProps = {
  error: VerificationErrorState;
  className?: string;
};

export const VerificationErrorCard = memo(function VerificationErrorCard({
  error,
  className,
}: VerificationErrorCardProps) {
  return (
    <View
      className={cn(
        'flex-row items-start rounded-xl border border-brand-error/30 bg-brand-error-light px-md py-md',
        className,
      )}
    >
      <AlertCircleIcon size={iconSizes.md} color={brandColors.error} />
      <View className="ml-sm flex-1">
        <Typography variant="roleTitle" className="text-[14px] text-brand-error">
          {error.title}
        </Typography>
        <Typography
          variant="roleDescription"
          className="mt-xs text-[13px] leading-5 text-brand-body"
        >
          {error.message}
        </Typography>
      </View>
    </View>
  );
});

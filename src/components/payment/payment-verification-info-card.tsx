import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

const DEFAULT_MESSAGE =
  'Payment verification normally takes 15–30 minutes during banking hours. You will receive a notification once verified.';

type PaymentVerificationInfoCardProps = {
  message?: string;
  className?: string;
};

export const PaymentVerificationInfoCard = memo(function PaymentVerificationInfoCard({
  message = DEFAULT_MESSAGE,
  className,
}: PaymentVerificationInfoCardProps) {
  return (
    <View
      className={cn(
        'flex-row items-start rounded-xl border border-brand-success/30 bg-brand-success-light px-md py-md',
        className,
      )}
    >
      <InfoIcon size={iconSizes.md} color={brandColors.success} />
      <Typography
        variant="roleDescription"
        className="ml-sm flex-1 text-[13px] leading-5 text-brand-success"
      >
        {message}
      </Typography>
    </View>
  );
});

import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ShieldSmallIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type VerificationBannerProps = {
  message?: string;
  className?: string;
};

export const VerificationBanner = memo(function VerificationBanner({
  message = 'Your documents are encrypted and securely stored. We do not share your data with third parties for marketing purposes.',
  className,
}: VerificationBannerProps) {
  return (
    <View
      className={cn(
        'w-full flex-row items-start gap-md rounded-lg bg-brand-surface px-lg py-md',
        className,
      )}
    >
      <ShieldSmallIcon color={brandColors.primary} size={18} />
      <Typography variant="legal" className="flex-1 text-left text-brand-body">
        {message}
      </Typography>
    </View>
  );
});

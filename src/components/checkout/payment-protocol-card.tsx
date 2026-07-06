import { memo } from 'react';

import { Text, View } from 'react-native';


import { Typography } from '@/components/ui/typography';
import { CHECKOUT_PAYMENT_PROTOCOL } from '@/constants/checkout';
import { InfoIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type PaymentProtocolCardProps = {
  className?: string;
};

const Highlight = ({ children }: { children: string }) => (
  <Text className="font-sans text-[13px] font-semibold text-brand-primary">{children}</Text>
);

export const PaymentProtocolCard = memo(function PaymentProtocolCard({
  className,
}: PaymentProtocolCardProps) {
  const { title, bodyPrefix, bodyMiddle, bodySuffix, highlights } = CHECKOUT_PAYMENT_PROTOCOL;

  return (
    <View

      className={cn(
        'mx-lg flex-row rounded-2xl border border-brand-primary/20 bg-brand-primary-tint p-lg',
        className,
      )}
      style={elevation.sm}
    >
      <View className="mr-md h-8 w-8 items-center justify-center rounded-full bg-brand-primary-light">
        <InfoIcon size={iconSizes.sm} color={brandColors.primary} />
      </View>

      <View className="flex-1">
        <Typography variant="roleTitle" className="mb-sm text-[14px] text-brand-heading">
          {title}
        </Typography>
        <Typography variant="roleDescription" className="text-[13px] leading-5 text-brand-body">
          {bodyPrefix}{' '}
          <Highlight>{highlights[0]}</Highlight>
          {' / '}
          <Highlight>{highlights[1]}</Highlight>{' '}
          {bodyMiddle}{' '}
          <Highlight>{highlights[2]}</Highlight>{' '}
          {bodySuffix}
        </Typography>
      </View>
    </View>
  );
});

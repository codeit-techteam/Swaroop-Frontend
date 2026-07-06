import { memo } from 'react';

import { Alert, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { PhoneIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { cn } from '@/utils/cn';

type SupportCardProps = {
  className?: string;
};

export const SupportCard = memo(function SupportCard({ className }: SupportCardProps) {
  const handleContact = () => {
    Alert.alert(
      'Contact Support',
      'Our enterprise relationship managers are available 24×7. Frontend placeholder only — no call is placed.',
      [{ text: 'OK' }],
    );
  };

  return (
    <View className={cn('rounded-2xl bg-brand-heading px-lg py-lg', className)}>
      <Typography variant="roleTitle" className="text-[16px] text-brand-white">
        Need Assistance?
      </Typography>
      <Typography
        variant="roleDescription"
        className="mt-sm text-[12px] leading-[18px] text-brand-primary-light"
      >
        Our enterprise relationship managers are available 24×7 to assist with payment and credit
        options.
      </Typography>

      <Pressable
        onPress={handleContact}
        accessibilityRole="button"
        accessibilityLabel="Contact support"
        className="mt-md flex-row items-center justify-center self-center rounded-full bg-brand-white px-lg py-sm"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <PhoneIcon size={iconSizes.sm} color={brandColors.heading} />
        <Typography variant="roleTitle" className="ml-sm text-[13px] text-brand-heading">
          Contact Support
        </Typography>
      </Pressable>
    </View>
  );
});

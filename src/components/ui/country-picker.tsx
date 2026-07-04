import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { IndiaFlagIcon } from '@/icons';
import { cn } from '@/utils/cn';

type CountryPickerProps = {
  className?: string;
  code?: string;
};

export const CountryPicker = memo(function CountryPicker({
  className,
  code = '+91',
}: CountryPickerProps) {
  return (
    <View className={cn('flex-row items-center gap-sm pr-md', className)}>
      <IndiaFlagIcon />
      <Typography variant="input" className="font-semibold text-brand-primary">
        {code}
      </Typography>
      <View className="h-5 w-px bg-brand-border" />
    </View>
  );
});

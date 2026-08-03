import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { cn } from '@/utils/cn';

type Accent = 'navy' | 'blue' | 'green' | 'red';

const accentMap: Record<Accent, { border: string; bg: string; text: string }> = {
  navy: { border: 'border-brand-border', bg: 'bg-brand-white', text: 'text-brand-heading' },
  blue: { border: 'border-[#DBEAFE]', bg: 'bg-[#F8FBFF]', text: 'text-[#1D4ED8]' },
  green: { border: 'border-brand-success-light', bg: 'bg-[#F7FCF8]', text: 'text-brand-success' },
  red: { border: 'border-brand-error-light', bg: 'bg-[#FFFBFB]', text: 'text-brand-error' },
};

export const DispatchSummaryCard = memo(function DispatchSummaryCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: number;
  accent: Accent;
}) {
  const tones = accentMap[accent];
  return (
    <View className={cn('min-h-[96px] flex-1 rounded-2xl border px-md py-md', tones.border, tones.bg)}>
      <Typography variant="roleDescription" className="text-left text-brand-body">
        {title}
      </Typography>
      <Typography variant="headingLeft" className={cn('mt-sm text-[30px]', tones.text)}>
        {value}
      </Typography>
    </View>
  );
});

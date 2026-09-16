import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type ProductHighlightsProps = {
  highlights: string[];
  className?: string;
};

export const ProductHighlights = memo(function ProductHighlights({
  highlights,
  className,
}: ProductHighlightsProps) {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <View
      className={cn(
        'mx-lg flex-row flex-wrap rounded-xl border border-brand-border bg-brand-surface px-md py-md',
        className,
      )}
      style={{ gap: 8 }}
      accessibilityLabel="Product highlights"
    >
      {highlights.map((item) => (
        <View
          key={item}
          className="flex-row items-center rounded-lg bg-brand-white px-sm py-xs shadow-sm"
        >
          <CheckCircleIcon size={14} color={brandColors.success} />
          <Typography
            variant="caption"
            className="ml-xs font-sans text-[12px] normal-case tracking-normal text-brand-heading"
          >
            {item}
          </Typography>
        </View>
      ))}
    </View>
  );
});

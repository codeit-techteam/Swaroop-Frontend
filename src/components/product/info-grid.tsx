import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { ProductInfoItem } from '@/types/product';
import { cn } from '@/utils/cn';

type InfoGridProps = {
  items: ProductInfoItem[];
  className?: string;
};

export const InfoGrid = memo(function InfoGrid({ items, className }: InfoGridProps) {
  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="mb-md text-[16px] text-brand-heading">
        Product Information
      </Typography>

      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {items.map((item) => (
          <View
            key={item.id}
            className="min-w-[46%] flex-1 rounded-lg bg-brand-surface px-md py-md"
            style={{ flexBasis: '46%' }}
          >
            <Typography
              variant="fieldLabel"
              className="text-[10px] tracking-[0.8px] text-brand-muted"
            >
              {item.label}
            </Typography>
            <Typography
              variant="roleTitle"
              className={cn(
                'mt-xs text-[13px]',
                item.accent ? 'text-brand-primary-dark' : 'text-brand-heading',
              )}
              numberOfLines={2}
            >
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});

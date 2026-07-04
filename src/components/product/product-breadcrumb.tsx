import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type ProductBreadcrumbProps = {
  category: string;
  productName: string;
  className?: string;
};

export const ProductBreadcrumb = memo(function ProductBreadcrumb({
  category,
  productName,
  className,
}: ProductBreadcrumbProps) {
  return (
    <View className={cn('bg-brand-background px-lg py-sm', className)}>
      <View className="flex-row flex-wrap items-center">
        <Typography
          variant="caption"
          className="font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          Market
        </Typography>
        <Typography
          variant="caption"
          className="mx-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          &gt;
        </Typography>
        <Typography
          variant="caption"
          className="font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          {category}
        </Typography>
        <Typography
          variant="caption"
          className="mx-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          &gt;
        </Typography>
        <Typography
          variant="roleTitle"
          className="text-[12px] text-brand-heading"
          numberOfLines={1}
        >
          {productName}
        </Typography>
      </View>
    </View>
  );
});

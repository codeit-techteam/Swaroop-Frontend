import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type ProductFeaturesProps = {
  features: string[];
  className?: string;
};

export const ProductFeatures = memo(function ProductFeatures({
  features,
  className,
}: ProductFeaturesProps) {
  if (features.length === 0) {
    return null;
  }

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
        Product Features
      </Typography>
      <View className="mt-md" style={{ gap: 10 }}>
        {features.map((feature) => (
          <View key={feature} className="flex-row items-start">
            <View className="mt-0.5">
              <CheckCircleIcon size={18} color={brandColors.success} />
            </View>
            <Typography
              variant="roleDescription"
              className="ml-sm flex-1 text-[14px] text-brand-heading"
            >
              {feature}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});

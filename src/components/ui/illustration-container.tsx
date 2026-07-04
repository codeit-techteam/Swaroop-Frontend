import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { borderRadius } from '@/theme/border-radius';
import { brandColors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

type IllustrationContainerProps = {
  children: ReactNode;
  caption?: string;
  captionVariant?: 'caption' | 'illustrationLabel';
  className?: string;
  showCard?: boolean;
};

export const IllustrationContainer = memo(function IllustrationContainer({
  children,
  caption,
  captionVariant = 'caption',
  className,
  showCard = false,
}: IllustrationContainerProps) {
  return (
    <View className={cn('w-full items-center', className)}>
      <View
        className="w-full items-center justify-center"
        style={
          showCard
            ? {
                backgroundColor: brandColors.white,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.xl,
                paddingHorizontal: spacing.lg,
              }
            : undefined
        }
      >
        {children}
        {caption ? (
          <Typography variant={captionVariant} style={{ marginTop: spacing.md }}>
            {caption}
          </Typography>
        ) : null}
      </View>
    </View>
  );
});

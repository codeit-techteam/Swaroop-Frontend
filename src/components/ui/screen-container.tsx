import { memo, type ReactNode } from 'react';

import { View, type ViewProps } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brandColors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { cn } from '@/utils/cn';

type ScreenContainerProps = ViewProps & {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export const ScreenContainer = memo(function ScreenContainer({
  children,
  className,
  backgroundColor = brandColors.background,
  padded = true,
  edges = ['top', 'bottom'],
  style,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('flex-1', className)}
      style={[
        {
          backgroundColor,
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? Math.max(insets.bottom, spacing.sm) : 0,
          paddingLeft: edges.includes('left')
            ? insets.left + (padded ? spacing.screenHorizontal : 0)
            : padded
              ? spacing.screenHorizontal
              : 0,
          paddingRight: edges.includes('right')
            ? insets.right + (padded ? spacing.screenHorizontal : 0)
            : padded
              ? spacing.screenHorizontal
              : 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});

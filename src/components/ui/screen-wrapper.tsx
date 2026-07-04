import { memo, type ReactNode } from 'react';

import { ScrollView, View, type ViewProps } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

type ScreenWrapperProps = ViewProps & {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scrollable?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom')[];
};

export const ScreenWrapper = memo(function ScreenWrapper({
  children,
  className,
  contentClassName,
  scrollable = false,
  padded = true,
  edges = ['top', 'bottom'],
  ...props
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const topInset = edges.includes('top') ? insets.top : 0;
  const bottomInset = edges.includes('bottom') ? Math.max(insets.bottom, 8) : 0;

  if (scrollable) {
    return (
      <View className={cn('flex-1 bg-brand-background', className)} {...props}>
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn('grow', padded && 'px-xl', contentClassName)}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      className={cn('flex-1 bg-brand-background', padded && 'px-xl', className)}
      style={{
        paddingTop: topInset,
        paddingBottom: bottomInset,
      }}
      {...props}
    >
      {children}
    </View>
  );
});

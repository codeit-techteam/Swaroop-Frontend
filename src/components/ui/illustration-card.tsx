import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { cn } from '@/utils/cn';

type IllustrationCardProps = {
  children: ReactNode;
  className?: string;
};

export const IllustrationCard = memo(function IllustrationCard({
  children,
  className,
}: IllustrationCardProps) {
  return (
    <View
      className={cn(
        'w-full items-center justify-center overflow-hidden rounded-xl bg-brand-white',
        className,
      )}
    >
      {children}
    </View>
  );
});
